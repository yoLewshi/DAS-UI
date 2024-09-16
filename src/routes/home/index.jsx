import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import { GlobalContext, addMessage } from '../../shared_components/globalContext';
import DASTable from '../../shared_components/das_table';
import LoggerDetails from '../../shared_components/logger_details';

import { getAPI } from '../../shared_methods/api';
import { setValue } from '../../shared_methods/cache';
import { connectLoggerStatuses, parseOutput } from '../../shared_methods/loggerStatus';
import { websocket } from '../../shared_methods/websocket';

import styles from "./style.module.css";

import classNames from 'classnames/bind';


let cx = classNames.bind(styles);

function Home() {
    const [cruiseSpecificLoggers, setCruiseSpecificLoggers] = useState([]);
    const [loggers, setLoggers] = useState({});
    const loggersRef = useRef();
    const [selectedLogger, setSelectedLogger] = useState(null);
    const [loggerRows, setLoggerRows] = useState([]);
    const [lastSocketResponse, setLastSocketResponse] = useState({});
    const [loggerStatusDetails, setLoggerStatusDetails] = useState({});

    const { setMessages, messagesRef, global } = useContext(GlobalContext);

    const dismissButton = <i className={cx(["bi", "bi-hand-thumbs-up-fill", "dismiss_alerts"])} onClick={dismissAlerts} data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={"Clear warnings"}></i>;
    const headers = ["\u00A0", "Active Config", "\u00A0", dismissButton];

    function onLoad() {
       getLoggers();
    }

    useEffect(onLoad, []);

    function getLoggers() {
         getAPI("/cruise-configuration/").then((response) => {

            if(response) {
                setCruiseSpecificLoggers(response.configuration?.cruise_specific_loggers || []);
                setLoggers(response.configuration?.loggers || {});
            } else {
                // keep trying incase backend comes back online
                setTimeout(getLoggers, 30000)
            }
        })
    }


    function loggerSelected(row) {
        setSelectedLogger(row[0]);
    }

    const highlightFn = (row) => {
        return row[1].indexOf("off") != -1;
    }

    function JSONstringifyOrder(obj, space)
    {
        const allKeys = new Set();
        JSON.stringify(obj, (key, value) => (allKeys.add(key), value));
        return JSON.stringify(obj, Array.from(allKeys).sort(), space);
    }
    
    function onLoggerStatusUpdate(updatedLoggers) {
        // this is passed from the details component to avoid multiple websocket connections
        // the details component closes/reloads and changes the websocket so all the logic is there instead of here
        if(JSONstringifyOrder(updatedLoggers) === JSONstringifyOrder(loggersRef.current))
        {
            // avoid re-render of child components
        }
        else if(!Object.keys(updatedLoggers).length) {
            // cache server empty, shouldn't happen in production
            console.debug("cache server empty");
        }
        else
        {
            // don't delete newly added loggers without cache data
            loggersRef.current = Object.assign({}, loggers  ?? {}, updatedLoggers);
            setLoggers(loggersRef.current);
        }
    }

    function onDetailedLoggerStatus(socketResponse) {
        const statusDetails = {};
        setLastSocketResponse(socketResponse);

        Object.keys(socketResponse).map((key) => {
            if(key.indexOf("stderr:logger:") == 0) {
                const loggerName = key.replace("stderr:logger:", "");
                const liveLogOutput = socketResponse[`logger:${loggerName}`];

                statusDetails[loggerName] = parseOutput(socketResponse[key], liveLogOutput);
            }
        })

        setLoggerStatusDetails(statusDetails);
    }

    function applyStatusClasses(row) {
        const loggerName = row[0];
        const rowStatus = loggerStatusDetails[loggerName];
        const classes = [];

        if(row[1].indexOf("off") > -1) {
            // don't highlight errors for loggers that are turned off
            return classes
        }

        if(rowStatus) {
            if(rowStatus.errorRate >= 100) {
                classes.push(styles["full_error_rate"]);
            } else if(rowStatus.errorRate >= 50) {
                classes.push(styles["high_error_rate"]);
            } else if(rowStatus.errorRate > 0) {
                classes.push(styles["low_error_rate"]);
            }

            if(rowStatus.warningRate >= 100) {
                classes.push(styles["full_warning_rate"]);
            } else if(rowStatus.warningRate >= 50) {
                classes.push(styles["high_warning_rate"]);
            } else if(rowStatus.warningRate > 0) {
                classes.push(styles["low_warning_rate"]);
            }

            const adhocLoggers = ["Events"];

            // haven't heard from it in 10 minutes
            const worryingTimeout = 10 * 60 * 1000;
            // allow some loggers to not show a warning if they don't always provide data
            if(rowStatus.lastUpdated.getTime() < ((new Date()).getTime() - worryingTimeout) && !adhocLoggers.includes(loggerName)) {
                classes.push(styles["outdated"]);
            }
        }

        return classes;
    }

    function dismissAlerts() {
        // this value is used in the loggerStatus methods instead of the cutoff
        setValue("dismissedAlerts", Date.now());
        addMessage(messagesRef, setMessages, "You're ignoring the current logger errors and warnings on this machine", "warning")
        onDetailedLoggerStatus(lastSocketResponse);
    }

    function parseConfigName(fullConfigName) {
        try {
            return fullConfigName.split("->")[1];
        } catch (e) {
            return fullConfigName;   
        }
    }

    const ref = useCallback((node) => {
        if(node != null) {
            const tooltipTriggerList = node.querySelectorAll(`.${styles.cruise_logger_icon}[data-bs-toggle="tooltip"], .${styles.active_logger_icon}[data-bs-toggle="tooltip"], .bi-hand-thumbs-up-fill[data-bs-toggle="tooltip"]`);

            [...tooltipTriggerList].map(tooltipTriggerEl => {
                // eslint-disable-next-line no-undef
                bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
            })
        }
    });

    useEffect(() => {
        connectLoggerStatuses(websocket, onDetailedLoggerStatus);
        
        const activeLoggerIcon = <i className={cx(["bi", "bi-check-circle-fill", "active_logger_icon"])}  data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={"Logger is running"}></i>;
        const cruiseLoggerIcon = <i className={cx(["bi", "bi-file-text-fill", "cruise_logger_icon"])}  data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={"Specific to this cruise file"}></i>;

        const sortedRows = Object.keys(loggers).sort((a, b) => { 
            return a < b ? -1 : 1;
        });

        setLoggerRows(sortedRows.map((loggerName) => {
            const loggerDetails = loggers[loggerName];
            // the original page props (.active) don't use the same key as the websocket response (.config)
            return [
                loggerName, (parseConfigName(loggerDetails.active) || parseConfigName(loggerDetails.config)), 
                loggerDetails.status == "RUNNING" ? activeLoggerIcon : "",
                cruiseSpecificLoggers.includes(loggerName) ? cruiseLoggerIcon : "",
            ];
        }));

        // selected first logger when page loads
        if(sortedRows.length && !selectedLogger) {
            setSelectedLogger(sortedRows[0]);
        }
    }, [loggers])

    return (  
        <>
            <div className={classNames(["container-fluid", styles.grid])}>
                <div className="row">
                    <div className={classNames(["col", "col-3", styles.loggers_col])} ref={ref}>
                        <DASTable headers={headers} rows={loggerRows} onClick={loggerSelected} highlightFn={highlightFn} classesFn={applyStatusClasses} showSelected={true} firstSelected={0}/>                       
                    </div>
                    <div className={classNames(["col", "col-9", styles.details_col])}>
                        <LoggerDetails loggerName={selectedLogger} onLoggerStatusUpdate={onLoggerStatusUpdate}/>
                    </div>
                </div>
            </div>
        </>
    )
};

export default Home;
import React, {useCallback, useEffect, useRef, useState} from 'react';
import DASTable from '../../shared_components/das_table';
import LoggerDetails from '../../shared_components/logger_details';

import { getAPI } from '../../shared_methods/api';
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
    const [loggerStatusDetails, setLoggerStatusDetails] = useState({});

    const headers = ["\u00A0", "Active Config", "\u00A0", "\u00A0"];

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

        if(row[1].indexOf("->off") > -1) {
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

    const ref = useCallback((node) => {
        if(node != null) {
            const tooltipTriggerList = node.querySelectorAll(`.${styles.cruise_logger_icon}[data-bs-toggle="tooltip"], .${styles.active_logger_icon}[data-bs-toggle="tooltip"]`);

            [...tooltipTriggerList].map(tooltipTriggerEl => {
                bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
            })
        }
    });

    useEffect(() => {
        connectLoggerStatuses(websocket, onDetailedLoggerStatus);

        const activeLoggerIcon = <i className={cx(["bi", "bi-check-lg", "active_logger_icon"])}  data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={"Logger is running"}></i>;
        const cruiseLoggerIcon = <i className={cx(["bi", "bi-file-text-fill", "cruise_logger_icon"])}  data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title={"Specific to this cruise file"}></i>;

        const sortedRows = Object.keys(loggers).sort((a, b) => { 
            return a < b ? -1 : 1;
        });

        setLoggerRows(sortedRows.map((loggerName) => {
            const loggerDetails = loggers[loggerName];
            // the original page props (.active) don't use the same key as the websocket response (.config)
            return [
                loggerName, (loggerDetails.active ||  loggerDetails.config), 
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
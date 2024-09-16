import React, {useContext, useEffect, useRef, useState} from 'react';
import { addMessage, GlobalContext } from '../globalContext';
import Panel from "../panel";
import TabBar from '../tab_bar';
import ConfigEditor from '../config_editor';
import LogViewer from '../log_viewer';
import StatusIndicator from '../status_indicator';
import FieldTable from '../field_table';
import { postAPI } from '../../shared_methods/api';
import {websocket} from "../../shared_methods/websocket";

import { LOGGER_STATUS_EXPLANATIONS, LOGGER_STATUSES } from "../../shared_methods/constants";

import classNames from 'classnames/bind';
import styles from "./style.module.css";

let cx = classNames.bind(styles);

function LoggerDetails(props) {
    const {loggerName, onLoggerStatusUpdate} = props;
    const [ws, setWs] = useState(null);

    const loggerNameRef = useRef(loggerName);
    const lastStatusUpdateTime = useRef(0);
    const delayedReadyTimeout = useRef(null);
    
    const [status, setStatus] = useState("");
    
    const [stderrOutput, setStderrOutput] = useState([]);
    const [loggerOutput, setLoggerOutput] = useState([]);
    const pausedLoggers = useRef({"stderr": false, "logger": false})
    const [prevPauseSettings, setPrevPauseSettings] = useState(pausedLoggers.current)

    const [fieldMetadata, setFieldMetadata] = useState([]);
    const [fieldsLoading, setfieldsLoading] = useState(false);

    const {global, messagesRef, setMessages} = useContext(GlobalContext);

    const canSeeConfig = global.permissions?.manage_loggers != null;
    const canRestart = global.superuser;

    useEffect(() => {
        setWs(websocket());
    }, [])

    function buildSubscribeMessage(){
        const baseMessage = {
                'type':'subscribe',
                'interval': 1,
                'fields': {                  
                            'status:logger_status':{'seconds':-1}
                }
            }

        if(!pausedLoggers.current["stderr"]) {
            baseMessage["fields"][`stderr:logger:${loggerName}`] = {'seconds': 60, "back_records": 30}
        }

        if(!pausedLoggers.current["logger"]) {
            baseMessage["fields"][`logger:${loggerName}`] = {'seconds': 60, "back_records": 15}
        }

        // after subscribing set back to paused, this is needed so that it still subscribes when
        // changing logger whilst off the details tab
        pausedLoggers.current = prevPauseSettings
        return baseMessage
    }

    function buildDescribeMessage(){
        return {"type": "describe"};
    }

    function processMessage(message){
        ws.processResponse(message, parseLoggerResponse);
    }

    function shouldSendReadyMessage(message){
        if(loggerNameRef.current && !(message?.type == "describe")) {
            // if the only data is the service status we don't need 0.5s intervals
            // instead manually send the ready message after 5s
            if(pausedLoggers.current["stderr"] && pausedLoggers.current["logger"]) {
                // if there is already a delayed ready don't set up another one
                // this happens if multiple responses come from the websocket
                clearTimeout(delayedReadyTimeout.current)
                delayedReadyTimeout.current = setTimeout(() => { ws.send({'type':'ready'})}, 5000);
                return false;
            }

            return true;
        }
        else
        {
            return false;
        }
    }

    function parseDescribeResponse(message){
        const foundFields = Object.keys(message).reduce((agg, fieldName) => {
            if(message[fieldName].device == loggerNameRef.current)
            {
                const fieldInfo = message[fieldName];
                fieldInfo.fullName = fieldName;
                agg.push(fieldInfo);
            }

            return agg;
        }, []);

        setFieldMetadata(foundFields);
        setfieldsLoading(false);
    }

    function parseLoggerResponse(message, messageType){
        if(messageType == "describe"){
            parseDescribeResponse(message);
            return
        }

        for (var field_name in message) {
            var value_list = message[field_name];
            
            switch (field_name) {         
                case 'status:logger_status':
                    var [timestamp, logger_status] = value_list[value_list.length-1];                 
                    if (timestamp > lastStatusUpdateTime.current) {
                        lastStatusUpdateTime.current = timestamp;
                        const currentStatus = logger_status[loggerNameRef.current]?.status
                        setStatus(currentStatus);

                        if(currentStatus != 'RUNNING') {
                            setLoggerOutput([]);
                        }
                        
                        onLoggerStatusUpdate(logger_status);
                    }
                    break;
                default:
                    const LOGGER_STDERR_PREFIX = `stderr:logger:${loggerNameRef.current}`;
                    const LOGGER_OUTPUT_PREFIX = `logger:${loggerNameRef.current}`;
                    if (field_name.indexOf(LOGGER_STDERR_PREFIX) == 0) {
                        setStderrOutput(value_list);
                    }
                    else if (field_name.indexOf(LOGGER_OUTPUT_PREFIX) == 0)
                    {
                        // sometimes returns array of values
                        setLoggerOutput(value_list);  
                    }
            }
        }
    }

    function getLoggerDetails() {
        loggerNameRef.current = loggerName
        if(loggerName) {
            // doesn't like sending another subscribe so instead reload connection
            // BUG need to find way of sending the describe message as well as new subscription
            setfieldsLoading(true);
            // force loggers to play so that subscribe message builds correctly
            pausedLoggers.current = {"stderr": false, "logger": false}

            const afterFirstMessage = () => {
                ws.send(buildSubscribeMessage());
            }

            ws.reload(buildDescribeMessage, processMessage, shouldSendReadyMessage, afterFirstMessage);            
        }
    }

    function onLogsPaused(logsType, isPaused) {
        pausedLoggers.current[logsType] = isPaused;
    }

    useEffect(getLoggerDetails, [loggerName]);

    function onTabChange(targetId) {       
        const isDetailsTab = (targetId == "#DetailsTab");
        
        if(isDetailsTab) {
            pausedLoggers.current = prevPauseSettings

            if(shouldSendReadyMessage()) {
                // resume logs
                clearTimeout(delayedReadyTimeout.current)
                ws.send({'type':'ready'})
            }
        }
        else
        {
            setPrevPauseSettings(pausedLoggers.current);
            pausedLoggers.current = {"stderr": true, "logger": true}
        }    
    }

    function restartLogger(loggerName) {
        // this is crude and will fail for other naming conventions
        const offConfigName = `${loggerName}->off`;
        const onConfigName = `${loggerName}->on`;

        const path = `/edit-logger-config/${loggerName}/`;
         postAPI(path, {"logger_id": loggerName, "config": offConfigName, "update": true}).then((response) => {
            if(response.APIMeta.status === 200) {
                addMessage(messagesRef, setMessages, `Request to change config to ${offConfigName} received`);

                setTimeout(() => {
                    postAPI(path, {"logger_id": loggerName, "config": onConfigName, "update": true}).then((response) => {
                        if(response.APIMeta.status === 200) {
                            addMessage(messagesRef, setMessages, `Request to change config to ${onConfigName} received`);
                        }
                    })
                }, 1000);
            }
        })
    }

    const tabViews = [
        {
            label: "Output",
            targetId: "#DetailsTab",
            active: true
        }
    ]

    if(canSeeConfig) {
        tabViews.push(
            {
                label: "Switch Config",
                targetId: "#ConfigTab"
            }
        );
    }


    const headerContent = () => {
        return (
            <div className={cx(["card-header", "bg-transparent", "header"])}>
                <h2 className={cx(["text-bg-dark", "logger_name"])}>{loggerName || '\u00A0'}</h2>
                <StatusIndicator status={status} possibleStatuses={LOGGER_STATUSES} explanations={LOGGER_STATUS_EXPLANATIONS} hideBars={true} cssClasses={["me-3"]}/>
                <TabBar views={tabViews} onChange={onTabChange}/>
                {canRestart && <button className={cx(["btn", "btn-warning", "me-3", "restart_button"])} type="button" onClick={restartLogger.bind(null, loggerName)}>Restart</button>}
            </div>
        )
    }

    return (  
        <Panel showHeader={true} customHeader={headerContent} cssClasses={[styles.details_panel]}>
            <div className="tab-content h-100">
                <div id="DetailsTab" className={cx(["container-fluid", "details_content", "tab-pane", "active"])} role="tabpanel">
                    <div className="row">                 
                        <div className={cx(["col-8", "logs_col"])}>
                            <div className="row h-100">
                                <div className="col-12 h-100">
                                    <div className={cx(["left_pane", "h-100"])}>
                                        <div className={cx(["logs_output"])}>
                                            <LogViewer loggerName={loggerName} loggerOutput={loggerOutput} label={"Input from Reader"} linesToKeep={15} onPauseToggled={onLogsPaused.bind(null, "logger")} showControls={true} cssClasses={["pb-2"]}/>
                                            <LogViewer loggerName={loggerName} loggerOutput={stderrOutput} label={"Logger stderr"} linesToKeep={50} onPauseToggled={onLogsPaused.bind(null, "stderr")} showControls={true} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cx(["col-4", "fields_col"])}>
                            <FieldTable fields={fieldMetadata} loading={fieldsLoading}/>
                        </div>
                    </div>
                    
                </div>
                { canSeeConfig && <div id="ConfigTab" className={cx(["container-fluid", "details_content", "tab-pane"])} role="tabpanel">
                    <ConfigEditor loggerName={loggerName}/>
                </div>}
            </div>
        </Panel>
    )
};

export default LoggerDetails;
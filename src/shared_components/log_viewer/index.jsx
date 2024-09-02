import React, {useEffect, useRef, useState} from 'react';
import Loader from "../loader";
import {formatLogs} from "../../shared_methods/logs";
import {websocket} from "../../shared_methods/websocket";

import sanitizeHtml from 'sanitize-html';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function LogViewer(props) {
    const {loggerName, loggerOutput, label, linesToKeep, onPauseToggled, showControls} = props;
    const {cssClasses} = props || [];
    const {parseLogLine} = websocket();

    const [logstoDisplay, setLogsToDisplay] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const lastUpdateTime = useRef(0);

    useEffect(() => {
        setShowLoader(true);
        setLogsToDisplay([]);
        lastUpdateTime.current = 0;

        setTimeout(setShowLoader.bind(null, false), 60000);
    },[loggerName])

    useEffect(() => {
            let logs = [];
            let lastTimeStamp = lastUpdateTime.current;
            loggerOutput.map(([timestamp, logLine]) => {
                if (timestamp > lastTimeStamp) {
                    lastTimeStamp = timestamp;
                    const newLogLines = parseLogLine(logLine);
                    logs = logs.concat(newLogLines)
                }
            });

            lastUpdateTime.current = lastTimeStamp;
            if(!isPaused) {
                setLogsToDisplay((oldLogs) => {
                    const newLogs = oldLogs.concat(logs);
                    return newLogs.slice(-linesToKeep);
                })
            }

            // delay allows loader to fade out
            if(showLoader) {
                setTimeout(setShowLoader.bind(null, false), 300);
            }
            
        }, [loggerOutput]
    )

    function togglePause(shouldPause) {
        setIsPaused(shouldPause);
        onPauseToggled(shouldPause);
    }

    const combinedLogs = formatLogs(logstoDisplay).join("\n");
    const HTMLlogs = combinedLogs.indexOf("<span") > -1 ? sanitizeHtml(combinedLogs, {
        allowedAttributes: Object.assign(sanitizeHtml.defaults.allowedAttributes, {"span": ["class"]})
    }) : combinedLogs;

    return (  
        <div className={cx(["log_viewer"].concat(cssClasses))}>
            {showControls && (
                <div className={cx(["btn-group", "pb-1", "controls"])} role="group">
                    <button className={cx(["btn", "btn-sm", "btn-dark"])} onClick={togglePause.bind(null, true)} disabled={isPaused}>
                        <i className="bi bi-pause-fill"></i>
                    </button>
                    <button className={cx(["btn", "btn-sm", "btn-dark"])} onClick={togglePause.bind(null, false)} disabled={!isPaused}>
                        <i className="bi bi-play-fill"></i>
                    </button>
                    {label ? <b className={cx(["ms-3", "label", "text-bg-dark"])}>{label}</b> : <></>}
                </div>
            )}
            
            <pre>
                {showLoader && <Loader hidden={lastUpdateTime.current > 0 || !loggerName} />}
                {<span dangerouslySetInnerHTML={{ __html: HTMLlogs }}></span>}
            </pre>
        </div>
    )
};

export default LogViewer;
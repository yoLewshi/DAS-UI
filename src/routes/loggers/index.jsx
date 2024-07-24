import React, {useContext, useEffect, useRef, useState} from 'react';

import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import DASTable from '../../shared_components/das_table';
import Panel from "../../shared_components/panel";
import YamlEditor from '../../shared_components/yaml_editor';
import {getAPI, postAPI} from '../../shared_methods/api';
import { checkForPermission } from '../../shared_methods/permissions';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

function LoggerEditPage() {
    const [loggerName, setLoggerName] = useState("");
    const [loggers, setLoggers] = useState([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedLoggerId, setSelectedLoggerId] = useState("");
    const [selectedConfig, setSelectedConfig] = useState("");
    const [loggerRows, setLoggerRows] = useState([]);

    const { setMessages, messagesRef, global } = useContext(GlobalContext);
    const editor = useRef(null);
    
    const permissionFailed = checkForPermission(global.permissions, "manage_loggers");
    if(permissionFailed) {
        return permissionFailed
    }

    function getLoggers(callback) {
        return getAPI(`/persistent-loggers/all`, callback)
    }

    useEffect(() =>{
        getLoggers(parseLoggers);
    }, [])

    useEffect(() => {
        buildLoggerTable(loggers.persistent_loggers);

        if(!selectedLoggerId) {
            openConfig(loggers.length ? loggers[0] : [null, "\u00A0", ""])
        }
        else {
            const matchingLogger = loggers.find((row) => row[0] == selectedLoggerId);
            openConfig(matchingLogger);
        }
        

    }, [loggers])

    function parseLoggers(loggerResponse) {
        setLoggers(loggerResponse.persistent_loggers);
    }

    function buildLoggerTable() {
        setLoggerRows(loggers.map((row) => { return [row[0], row[1]]; }));
    }

    function openConfig(selectedRow) {
        setSelectedLoggerId(selectedRow[0]);
        setLoggerName(selectedRow[1]);

        const config = loggers.find((row) => row[0] == selectedRow[0]);
        setSelectedConfig(config ? config[2]?? "" : "");
    }

    function newLogger() {
        openConfig([null, "New Logger", ""]);
    }

    function saveLogger() {
        const name = document.querySelector("#NameInput").value;
        const fileContent = editor.current.getModifiedEditor().getValue();

        postAPI(`/persistent-loggers/${name}`, {logger_id:selectedLoggerId, logger_config: fileContent}, (response) => {
            if(!response.errors) {
                setHasChanges(false);
            }

            addMessage(messagesRef, setMessages, response.message, response.errors ? "error" : undefined);
            getLoggers(parseLoggers);
        });
    }

    const headerContent = function() {
        return (
            <div className={cx(["card-header", "bg-transparent", "header"])}>
                <h2 className={cx(["text-bg-dark", "logger_name"])}>{loggerName || '\u00A0'}</h2>
            </div>
        )
    }

    const helpText = <>
        <p>
            A <b>Persistent Logger</b> is a <b>Logger</b> that is not defined by the cruise file currently loaded. These loggers are intended to always be available and not affected by changes to the cruise mode.
        </p>
        <p>Using <b>Persistent Loggers</b> also keeps the id of each measurement value the same in the database.</p>
        <p>
            <div><b>Updating Configs in use</b></div>
            If you make changes to a <b>Config</b> that is currently in use you will need to change the <b>Logger</b> to a different <b>Config</b> and then change back for it to take effect.
        </p>
        <br/>
        <p>
            The editor on this page will show changes with a combination of lines with a red background (how the line was before it changed) and with a green background (what the line is now). 
        </p>
    </>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-2", "d-none", "d-xl-block"])}>
                        <DASTable headers={["Id", "Persistent Loggers"]} rows={loggerRows} onClick={openConfig} cssClasses={styles.logger_table} showSelected={true} firstSelected={0}/>
                        <button className={cx(["btn", "btn-dark", "mt-3", "add_button"])} type="button" onClick={newLogger}>Add Logger</button>
                    </div>
                    <div className={cx(["col", "col-12", "col-xl-8", "middle_col"])}>
                        <Panel showHeader={true} customHeader={headerContent} cssClasses={cx(["details_panel", "w-100"])}>
                            <div id="ConfigTab" className={cx(["container-fluid", "tab-pane", "active", "config_tab"])} role="tabpanel">
                                <div className={cx(["row", "centre_row"])}>
                                    <div className="col col-12">
                                        <div className={cx(["mb-3", "first_line"])}>
                                            <div className={cx(["input-group"])}>
                                                <span className="input-group-text">Name</span>
                                                <input type="text" id="NameInput" className="form-control" maxLength="255" onChange={setHasChanges.bind(null, true)} defaultValue={loggerName}></input>
                                            </div>
                                            <button className={cx(["btn", "btn-dark", "ms-3", "save_button"])} type="button" onClick={saveLogger} disabled={!hasChanges}>Save</button>
                                        </div>
                                         <div className={cx(["input-group", "mb-3", "config_editor_group"])}>
                                            <div><span className={cx(["input-group-text", "config_editor_label"])}>Config</span></div>
                                            <div className={cx(["config_editor"])}>
                                                <YamlEditor editorRef={editor} fileContent={selectedConfig} onChange={setHasChanges.bind(null, true)}/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                    <div className={cx(["col", "col-2", "d-none", "d-xl-block"])}>
                        <Panel showHeader={false} cssClasses={cx(["help_panel", "w-100"])}>
                            {helpText}
                        </Panel>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoggerEditPage;
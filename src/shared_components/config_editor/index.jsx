import React, {useContext, useEffect, useState} from 'react';

import ConfigChanger from '../config_changer';
import { addMessage, GlobalContext } from '../globalContext';
import {getAPI, postAPI} from '../../shared_methods/api';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function ConfigEditor(props) {

    const {isCruise, reloadOnChange} = props;
    const loggerName = isCruise ? "cruise" : props.loggerName;

    const [configOptions, setConfigOptions] = useState([]);
    const [fullConfig, setFullConfig] = useState({});
    const [activeConfigName, setActiveConfigName] = useState(null);
    const [currentConfig, setCurrentConfig] = useState(null);
    const [configToView, setConfigToView] = useState(null);

    const { setMessages, messagesRef } = useContext(GlobalContext)

    function getLoggerConfig(callback) {
        const path = isCruise ? "/cruise/get_config" : `/edit-logger-config/${loggerName}`;
        return getAPI(path, callback)
    }

    function updateSelectedConfig(configName) {
        const path = isCruise ? "/cruise/set_config/" : `/edit-logger-config/${loggerName}`;
        return postAPI(path, {"selectedConfig": configName}, onConfigUpdated.bind(null, loggerName, configName))
    }

    let checkChangeTimeout = null;

    function onConfigUpdated(loggerName, configName, response){
        if(response.success) {
            addMessage(messagesRef, setMessages, response.message);
            checkChangeTimeout = setTimeout(checkConfigChanged.bind(null, loggerName, configName), 1000)
        }
    }

    function checkConfigChanged(loggerName, expectedConfig) {
        const path = isCruise ? "/cruise/check_config_changed/" : `/logger/check_config_changed/${loggerName}`;
        return postAPI(path, {expectedConfig: expectedConfig} , (response) => {
            if(response.retry) {
                checkChangeTimeout = setTimeout(checkConfigChanged.bind(null, loggerName, configName), 1000)
            }
            else {
                if(response.success) {
                    addMessage(messagesRef, setMessages, response.message);
                    setActiveConfigName(expectedConfig);
                }
            }
        })
    }

    useEffect(()=>{
        if(loggerName) {
            getLoggerConfig((response)=> {
                const {fullConfig, availableConfigs, selectedConfig} = response;

                setFullConfig(fullConfig);
                setConfigToView(selectedConfig);
                setCurrentConfig(selectedConfig);
                setConfigOptions(availableConfigs);
            });
        }
    }, [loggerName, activeConfigName, reloadOnChange])


    return (
        <div className={cx(["wrapper"])}>
            <div className="d-flex">
                <div className={cx(["edit_config_select"])}>
                    <ConfigChanger options={configOptions} initialValue={currentConfig} onSelect={setConfigToView} onUpdate={updateSelectedConfig}/>
                </div>
                {
                    loggerName && !isCruise && (
                    <a href={`/logger/config/${loggerName}`} className={cx(["icon-link", "edit_config_link"])}>
                        Explore Config
                        <i className="bi bi-journal-text"></i>
                    </a>)
                }
            </div>
            <div className={cx(["config_json", "mt-2"])}>
                <pre>
                {(fullConfig && configToView) && JSON.stringify(isCruise ? fullConfig : fullConfig[configToView], null, 3) || ""}
                </pre>
            </div>
        </div>
            
    )
};

export default ConfigEditor;
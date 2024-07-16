import React, {useContext, useEffect, useState} from 'react';
import ConfigEditor from '../../shared_components/config_editor';
import FileLoader from '../../shared_components/file_loader';
import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import {getAPI, postForm} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

function CruiseConfig(props) {

    const filePlaceholder = "No cruise file loaded";
    const [activeFilename, setActiveFilename] = useState(filePlaceholder);
    const { setMessages, messagesRef } = useContext(GlobalContext);

    useEffect(onLoad, []);

    function onLoad() {
        getAPI("/cruise-configuration/").then((response) => {
            setActiveFilename(response.configuration?.filename);
        });
    }

    function onCruiseFileUpdate(cruiseFile) {
        const formData = new FormData();
        formData.append("file", cruiseFile);
        formData.append("filename", cruiseFile.name);

        postForm('/upload-configuration/', formData, (response) => {

            if(response.APIMeta.status === 200) {
                addMessage(messagesRef, setMessages, "Cruise config uploaded");
                if(!response.errors.length) {
                    setActiveFilename(cruiseFile.name);
                } else {
                    addMessage(messagesRef, setMessages, response.errors.join("\n"), "error");
                    console.error(response.errors);
                }
            }
        })
    }

    function openCruiseEdit() {
        if(activeFilename != filePlaceholder) {
            window.open(`/edit_yaml?file=${activeFilename}`, "_blank")
        }
    }

    const helpText = <>
        <p>Uploading a new cruise config file will remove all loggers associated with the old one.<br/>
        <b>Note:</b> Avoid doing this during a voyage as it is likely to disrupt data capture for voyage specific loggers.</p>
        <p><b>Persistent Loggers</b> (those not marked with a file icon on the main page) will not be affected by a change in cruise config.</p>
    </>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-3", "loggers_col"])}>
                        <FileLoader onUpdate={onCruiseFileUpdate} />
                        <div className={"mt-3"}>Active cruise file: <b>{activeFilename}</b> {activeFilename != filePlaceholder && (<i className="bi bi-pencil-square" onClick={openCruiseEdit}></i>)}</div>
                        <div className="mt-3">{helpText}</div>
                    </div>
                    <div className={cx(["col", "col-9", "details_col"])}>
                        <ConfigEditor isCruise={true} reloadOnChange={activeFilename}/>
                    </div>
                </div>
            </div>
        </>
    )
};

export default CruiseConfig;
import React, {useContext, useState} from 'react';

import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import Panel from '../../shared_components/panel';

import {getAPI} from '../../shared_methods/api';
import { checkForSuperuser } from '../../shared_methods/permissions';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

function Shortcuts() {

    const { setMessages, messagesRef, global } = useContext(GlobalContext);
    const [activeCalls, setActiveCalls] = useState({});
    
    const permissionFailed = checkForSuperuser(global);
    if(permissionFailed) {
        return permissionFailed
    }

    function onClick(path) {
        setActiveCalls((prev) => {
            prev[path] = true;
            return Object.assign({}, prev);
        })
        getAPI(path).then((response) => {
            setActiveCalls((prev) => {
                delete prev[path];
                return Object.assign({}, prev);
            })

            if(response.status == "error") {
                addMessage(messagesRef, setMessages, response.message, "error");
            } else {
                addMessage(messagesRef, setMessages, response.message);
            }
        });
    }

    function renderButton(path, label) {
        return <button className="btn btn-dark" type="button" onClick={onClick.bind(null, path)} disabled={Object.keys(activeCalls).includes(path)}>{label}</button>
    }

    function renderPanel(path, label, description) {
        return  <Panel showHeader={true} showFooter={true} header={label} footer={renderButton(path, label)} fullwidth={false} cssClasses={cx(["mb-4", "w-100"])}>
                    <b className={cx(["path"])}>{path}</b>
                    <p dangerouslySetInnerHTML={{__html: description}}></p>
                </Panel>
    }

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-12"])}>
                        <h5 className="mt-4 ms-3 mb-4">Shortcuts to API functions</h5>
                        <div className={cx(["card_grid", "p-2"])}>
                            {renderPanel("/create-permissions/", "Create Permissions", "This endpoint creates django global UI permissions. Permissions can be assigned and edited via the django admin interface.")}
                            {renderPanel("/create-permission-groups/", "Create Permission Groups", "This endpoint creates django permission groups for admins and viewers with default global UI permissions. Groups can be assigned and edited via the django admin interface.")}
                            {renderPanel("/load-persistent-loggers/", "Load Persistent Loggers", "This endpoint reads logger <b>.yaml</b> files from <b>/local/logger_configs</b> on the OpenRVDAS server and creates persistent loggers which are not linked to a cruise file. Persistent Loggers can be edited in the UI without reloading a cruise or logger config file.")}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shortcuts;
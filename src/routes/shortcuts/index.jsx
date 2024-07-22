import React, {useContext, useState} from 'react';

import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import Panel from '../../shared_components/panel';

import {getAPI} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

function Shortcuts() {

    const { setMessages, messagesRef } = useContext(GlobalContext);
    const [activeCalls, setActiveCalls] = useState({});
    

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

    const permissionGroupBtn = <button className="btn btn-dark" type="button" onClick={onClick.bind(null, "/create-permission-groups/")} disabled={Object.keys(activeCalls).includes("/create-permission-groups/")}>Create Permission Groups</button>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-lg-4", "offset-lg-4"])}>
                        <h5 className="mt-4">Shortcuts to admin API functions</h5>
                        
                        <Panel showHeader={true} showFooter={true} header={"Create Permission Groups"} footer={permissionGroupBtn} fullwidth={false} cssClasses={cx(["help_panel", "w-100"])}>
                            <b className={cx(["path"])}>/create-permission-groups/</b>
                            <p>This endpoint creates django permission groups with the default global UI permissions. Groups can be assigned and edited via the django admin interface.</p>
                            
                        </Panel>
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default Shortcuts;
import React, {useContext, useEffect, useState} from 'react';
import DASTable from '../../shared_components/das_table';
import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import {getAPI, postAPI} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
import { checkForPermission } from '../../shared_methods/permissions';
let cx = classNames.bind(styles);

function UDPManager() {
    
    const [rows, setRows] = useState([]);
    const [changes, setChanges] = useState({});
    const { setMessages, messagesRef, global } = useContext(GlobalContext);
    const clientIP = global.clientIP || "Unknown";
    const [ipAddress, setIPAddress] = useState(clientIP);

    const permissionFailed = checkForPermission(global.permissions, "manage_udp");
    if(permissionFailed) {
        return permissionFailed
    }

    function updateSubscriptions () {
        postAPI("/update-udp-subscriptions/", {
            "ip": ipAddress,
            "changes": changes
        }, onSubscriptionsChanged)
    }

    function onSubscriptionsChanged(response) {
        addMessage(messagesRef, setMessages, response.message, response.errors ? "error" : undefined);
        
        if(!response.errors) {
            getSubscriptions().then((response) => {
                if(response.success){
                    setChanges({});
                }
            });
        }
    }

    function getSubscriptions() {
        return getAPI(`/get-udp-subscriptions-by-ip/${ipAddress}`, parseSubscriptions);
    }

    function parseSubscriptions(response) {
        if(response.APIMeta.status === 200) {
            setRows(response.rows.map((row) => {
                row.subscribed = row[3];
                row[3] = renderTick(row[3]);
                
                return row;
            }));
        }
        
        return response;
    }

    function renderTick(value) {
        return value ? <i className="bi bi-check-lg"></i> : "\u00A0";
    }

    function isChange(row) {
        return Object.keys(changes).includes(row[0]);
    }

    function toggleSubscription(row) {
        const oldValue = row.subscribed;
        row[3] = renderTick(!oldValue);
        row.subscribed = !oldValue
        updateChanges(row);
    }

    function updateIPAddress(event) {
        setIPAddress(event.target.value);
    }

    function updateChanges(row) {
        const alreadyChanged = isChange(row);

        if(alreadyChanged && changes[row[0]] != row.subscribed) {
            delete changes[row[0]];
        }
        else
        {
            changes[row[0]] = row.subscribed;
        }

        setChanges(Object.assign({}, changes))
    }

    useEffect(() => {
        getSubscriptions();
    }, []);

    const loggerTableHeaders = ["Logger ID", "Logger", "Port", "Subscribed"];
    const helpText = <>
        Loggers that show as <b>subscribed</b> have the IP address above stored for that logger and will be picked up by the UDP subscription writer if it is part of the config.<br/>
        <br/>
        When applying changes to subscriptions it may take up to <b>20 seconds</b> to come into effect. You should not need to alter the configuration of the logger.<br/>
    </>

    const noteText = <>
        The UDP subscription writer relies on there being only one logger with the name specified in the <b>subscription_logger_name</b> config parameter.
    </>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-lg-2", "loggers_col"])}>
                        <DASTable headers={loggerTableHeaders} rows={rows} highlightFn={isChange} onClick={toggleSubscription} cssClasses={styles.logger_table}/>
                    </div>
                    <div className={cx(["col", "col-lg-10"])}>
                        <div>
                            <div className={cx(["input-group", "mb-3", "ip_input"])}>
                                <span className="input-group-text">IP to subscribe</span>
                                <input type="text" id="IPInput" className="form-control" maxLength="32" onChange={updateIPAddress} defaultValue={clientIP}></input>
                                <button className="btn btn-dark" type="button" onClick={getSubscriptions} disabled={!ipAddress.length}>Check Subscriptions</button>
                            </div>
                            <div className="d-lg-inline-block ms-lg-3 mb-0 mb-sm-3 mb-lg-0">Your IP address is <b>{clientIP}</b></div>
                        </div>
                        <div className="row"><p>{helpText}</p></div>
                        <button className="btn btn-dark" type="button" onClick={updateSubscriptions} disabled={!Object.keys(changes).length}>Apply UDP Subscriptions</button>
                        <p className="mt-5">{noteText}</p>
                    </div>
                </div>
            </div>
        </>
    )
};

export default UDPManager;
import React, {useContext} from 'react';
import { useLocation } from 'react-router-dom';
import Feedback from "feeder-react-feedback";

import "../../style/feeder.module.css";

import { addMessage, GlobalContext } from '../globalContext';
import EventLogger from '../event_logger';
import UserAccountBlock from '../user_account_block';
import Clock from '../clock';
import {checkConnection} from '../../shared_methods/connection';

import classNames from 'classnames/bind';
import styles from "./style.module.css";

let cx = classNames.bind(styles);


function Menubar() {
    const page = window.location.pathname;
    const context = useContext(GlobalContext);
    const permissions = context?.global.permissions || {};
    
    const seeUtilities = permissions.manage_cruise || permissions.manage_udp || permissions.manage_loggers;
    const seeAdmin = context.global.superuser;

    const { setMessages, messagesRef } = useContext(GlobalContext);

    const buildNavItem = function(href, label) {
        return (
            <li className="nav-item">
                <a className={cx(["nav-link", {"active":page == href}])} href={href}>{label}</a>
            </li>
        )
    }

    const buildDropdownItem = function(href, label) {
        return (
            <li>
                <a className="dropdown-item" href={href}>{label}</a>
            </li>
        )
    }

    function utilitiesActive () {
        return ["/cruise/config", "/loggers", "/native", "/udp"].includes(page);
    }

    function adminActive () {
        return ["/admin/view_cache", "/admin/shortcuts"].includes(page);
    }

    // feedback is sent to https://feeder.sh/project/65791fb48c62fa0002aaea38
    function activateFeeder(event) {
        // make dummy http request to first check the feedback will be received
        const feedbackBtn = event.target;
        feedbackBtn.setAttribute("disabled", true);

        checkConnection().then(() => {
            const triggerBtn = document.querySelector(".frf-trigger-button");
            const isShown = triggerBtn.classList.toggle("show");
            
            const handleCloseClick = () => { 
                triggerBtn.classList.remove("show"); 
            }

            if(isShown) {
                triggerBtn.click();
                triggerBtn.addEventListener('click', handleCloseClick, {once: true});

                setTimeout(() =>{
                    const submitBtn = document.querySelector(".frf-modal-button");
                    submitBtn.addEventListener('click', () => { setTimeout(handleCloseClick, 3000)}, {once: true});
                }, 1000);
                
            } else {
                triggerBtn.click();
                handleCloseClick();
            }
        }).catch(() => {
            addMessage(messagesRef, setMessages, "No network connection. Feedback can only be sent while online", "error");
        }).finally(() => {
            feedbackBtn.removeAttribute("disabled");
        })
    }

    return (
        <>
        <EventLogger panelId={"EventLoggerPanel"} />
        <nav className="navbar navbar-expand-lg fixed-top">
            <div className="container-fluid">
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={cx(["collapse", "navbar-collapse", "justify-content-between", "top_bar"])} id="navbarSupportedContent">
                    <ul className="navbar-nav nav-underline m-0">
                        {permissions.view_home && buildNavItem("/", "Home")}
                        {permissions.view_grafana && buildNavItem("/grafana", "Grafana")}                                
                        {seeUtilities && <li className="nav-item dropdown">
                                <a className={cx(["nav-link", "dropdown-toggle", {"active":utilitiesActive()}])} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Utilities
                                </a>
                                <ul className="dropdown-menu">
                                    {permissions.manage_loggers && buildDropdownItem("/loggers", "Manage Loggers")}
                                    {permissions.manage_udp && buildDropdownItem("/udp", "UDP Subscriptions")}
                                    {permissions.manage_cruise && buildDropdownItem("/cruise/config", "Cruise Config")}
                                    {permissions.view_native && buildDropdownItem("/native", "Native OpenRVDAS")}
                                </ul>
                            </li>
                        }
                        {seeAdmin && <li className="nav-item dropdown">
                                <a className={cx(["nav-link", "dropdown-toggle", {"active":adminActive()}])} href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Admin
                                </a>
                                <ul className="dropdown-menu">
                                    {seeAdmin && buildDropdownItem("/admin/django", "Django Admin")}
                                    {seeAdmin && buildDropdownItem("/admin/shortcuts", "Shortcuts")}
                                    {seeAdmin && buildDropdownItem("/admin/view_cache", "View Cache")}
                                </ul>
                            </li>
                        }
                    </ul>
                    <Clock cssClasses={[styles.clock]}/>
                    <div>
                        {!context.global.connection?.websocket && <div className={cx(["me-3", "websocket_block"])}>
                                <i className={cx(["bi", "bi-exclamation-triangle-fill", "me-2", "warning_icon"])}></i>
                                <span>Websocket not connected</span>
                            </div>
                        }
                        <Feedback projectId="65791fb48c62fa0002aaea38" email={true}/>
                        <button className={cx(["btn", "btn-sm", "btn-dark", "me-3"])} onClick={activateFeeder}>
                            <i className={cx(["bi", "bi-chat-left-text-fill", "me-2"])} ></i>
                            Send Feedback
                        </button>
                        <button className={cx(["btn", "btn-sm", "btn-dark", "me-3"])} type="button" data-bs-toggle="offcanvas" data-bs-target="#EventLoggerPanel">
                            <i className={cx(["event_log_icon", "bi", "bi-stopwatch-fill", "me-2"])} ></i>
                            Add Event
                        </button>
                        <UserAccountBlock />
                    </div>
                </div>
            </div>
        </nav>
        </>
    )
};

export default Menubar;
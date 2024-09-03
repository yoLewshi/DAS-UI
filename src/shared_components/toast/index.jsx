import React, {useEffect, useContext} from 'react';

import { GlobalContext } from '../globalContext';
import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function Toast() {
    const { messages, setMessages, messagesRef } = useContext(GlobalContext);

    useEffect(()=> {
        setTimeout(() => {
            const toastElList = document.querySelectorAll('.toast');
            [...toastElList].map(toastEl => {
                const toastId = toastEl.id;
                if(!messages[toastId].shown) {
                    const bsToast = bootstrap.Toast.getOrCreateInstance(toastEl);
                    bsToast.show();
                    // default delay is 10 seconds, this gives time for fade in and out
                    setTimeout(removeToast.bind(null, toastEl.id), 10000);
                    messages[toastId].shown = true;
                }            
            })
        }, 0)
    }, [messages])

    function removeToast(toastId) {
        delete messages[toastId];
        delete messagesRef.current[toastId];
        setMessages(Object.assign({}, messagesRef.current));
    }

    function parseArrayContent(message) {
        return Array.isArray(message.content) ? message.content.map((line, i) => {
                                    return <React.Fragment key={i}>{line}<br/></React.Fragment>
                                }) : message.content;
    }

    return (  
        <div className="toast-container bottom-0 end-0 p-3">
            {
                Object.keys(messages).map((key) => {
                    const message = messages[key];
                    return (
                        <div className={cx(["toast", "toast_outer"])} role="alert" key={key} id={key} type={message.type}>
                            <div className={cx(["d-flex", "toast_wrapper"])}>
                                <div className={cx(["toast-body"])}>
                                {parseArrayContent(message)}
                                </div>
                                <button type="button" className="btn me-2 m-auto" data-bs-dismiss="toast">
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
};

export default Toast;
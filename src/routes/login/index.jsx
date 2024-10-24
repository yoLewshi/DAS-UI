import React, {useContext} from 'react';
import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import {clearAuth, postAPI} from '../../shared_methods/api';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

import logoURL from "../../assets/logo.svg";

function Login(props) {
    
    const {redirectTo} = props;
    const { setMessages, messagesRef, global, setGlobal, getAuthDetails } = useContext(GlobalContext);

    if(global.authToken) {
        window.location.replace(redirectTo || "/");
    }

    function submitLogin() {
        // make sure any outdated auth is removed
        clearAuth();

        const username = document.getElementById("Username").value;
        const password = document.getElementById("Password").value;

        const formData = {
            "username": username,
            "password": password,
            "redirect_to": redirectTo
        }

        postAPI("/obtain-auth-token/", formData, (response) => {
            if(response.token) {
                setGlobal(Object.assign({}, global, {authToken: response.token}));
                return getAuthDetails().then(() => {
                    window.location.replace(redirectTo || "/");
                })
            } else {
                console.error(response)
                addMessage(messagesRef, setMessages, response.message || response.non_field_errors, "error");
            }
        })
    }
    
    function checkSubmit(event) {
        if(event.key === "Enter") {
            submitLogin();
        }
    }

    return (  
        <div className="container-fluid">
            <div className="row">
                <div className="col offset-xl-4 col-xl-4">
                    <img src={logoURL} className={cx(["img-fluid", "mx-auto", "d-block", "das_logo"])} alt="DAS logo"></img>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col col-xl-4 offset-xl-4 col-sm-10 offset-sm-1">
                    <label htmlFor="Username" className="form-label"><h5>Username</h5></label>
                    <input type="text" className="form-control mb-3" id="Username" />
                    <label htmlFor="Password" className="form-label"><h5>Password</h5></label>
                    <input type="password" className="form-control" id="Password" onKeyUp={checkSubmit} />
                    <button type="button" className={cx(["btn", "btn-dark", "mt-3", "login_btn"])} onClick={submitLogin}>Log in</button>
                </div>
            </div>
        </div>
    )
};

export default Login;
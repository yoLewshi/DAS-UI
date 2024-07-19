import React, {useContext} from 'react';
import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import {clearAuth, postAPI} from '../../shared_methods/api';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

import logoURL from "../../assets/logo.svg";

function Login(props) {
    
    const {redirectTo} = props;
    const { setMessages, messagesRef, global, setGlobal } = useContext(GlobalContext);

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
                window.location.replace(redirectTo || "/");
            } else {
                addMessage(messagesRef, setMessages, response.message, "error");
            }
        })
    }

    return (  
        <div className="container-fluid">
            <div className="row">
                <div className="col offset-4 col-sm-4">
                    <img src={logoURL} className="img-fluid mx-auto d-block" alt="DAS logo"></img>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col col-lg-4 offset-lg-4 col-sm-10 offset-sm-1">
                    <label htmlFor="Username" className="form-label"><h5>Username</h5></label>
                    <input type="text" className="form-control mb-3" id="Username" />
                    <label htmlFor="Password" className="form-label"><h5>Password</h5></label>
                    <input type="password" className="form-control" id="Password" />
                    <button type="button" className={cx(["btn", "btn-dark", "mt-3", "login_btn"])} onClick={submitLogin}>Log in</button>
                </div>
            </div>
        </div>
    )
};

export default Login;
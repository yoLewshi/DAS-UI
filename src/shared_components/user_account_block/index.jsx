import React, {useContext} from 'react';
import { GlobalContext } from '../globalContext';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
import { clearAuth } from '../../shared_methods/api';
let cx = classNames.bind(styles);

function UserAccountBlock(props) {

    const context = useContext(GlobalContext);
    const {username} = context.global;

    function onClick(event) {
        clearAuth();
        window.location.replace("/login/");
    }

    return (  
        <div className={cx(["user_account_block", "pb-3", "pb-lg-0"])}>
            <i className="bi bi-person-square me-2"></i>
            <div>{username}</div>
            <button className={cx(["btn", "btn-sm", "btn-dark", "ms-3", "logout_button"])} type="button" onClick={onClick} disabled={!username}>Log out</button>
        </div>
    )
};

export default UserAccountBlock;
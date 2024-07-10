import React from 'react';
import classNames from 'classnames/bind';

import styles from "./style.module.css";

function Panel(props) {

    const {cssClasses} = props || [];
    const {header, footer, showHeader, showFooter, customHeader, fullWidth, onClick} = props;

    return (  
        <div className={classNames(["card", "border-dark", "m-1", styles.panel].concat(cssClasses))} onClick={onClick}>
            {
                showHeader && (customHeader ? customHeader() : <div className="card-header bg-transparent"><h2>{header}</h2></div>)
            }
            {
                fullWidth ? props.children :
                <div className="card-body">
                    {props.children}
                </div>
            }
            {
                showFooter && <div className={classNames(["card-footer", "bg-transparent", "border-dark"])}>{footer}</div>
            }
        </div>
    )
};

export default Panel;
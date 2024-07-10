import React from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function Loader(props) {

    const {hidden, centerBars} = props;

    return (  
            <div className={cx("wrapper", {"hidden": hidden, "center_bars": centerBars})}>
                <div className={cx("bars")}>
                    <div className={cx("bar")}></div>
                    <div className={cx("bar")}></div>
                    <div className={cx("bar")}></div>
                </div>
            </div>
            
    )
};

export default Loader;
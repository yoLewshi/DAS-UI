import React, {memo, useEffect, useState} from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function Clock(props) {

    const {timeZone} = props;
    const {cssClasses} = props || [];

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        setInterval(() => {
            setTime(new Date());
        }, 1000);
    }, []);

    return (  
        <div className={cx(["clock"].concat(cssClasses))}>
            <div>{String(time.getUTCHours()).padStart(2, "0")}</div>
            <span>:</span>
            <div>{String(time.getUTCMinutes()).padStart(2, "0")}</div>
            <span>:</span>
            <div>{String(time.getUTCSeconds()).padStart(2, "0")}</div>
            <span className={cx(["ps-2", "timezone"])}>UTC</span>
        </div>
    )
};

export default memo(Clock);
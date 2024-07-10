import React from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function TabBar(props) {

    const {views, onChange} = props;
    const {singleTabPane} = props || false;
    const {cssClasses} = props || [];

    return (  
        <ul className={cx(["nav", "nav-underline", "tab_bar"].concat(cssClasses))} role="tablist">
            {
                views.map((viewData, i) => {
                    return <li className={cx(["nav-item", {"highlight": viewData.highlight}])} role="presentation" key={i}>
                                <button className={cx(["nav-link", {"active": viewData.active}])} data-bs-toggle="pill" data-bs-target={singleTabPane ? null : viewData.targetId} type="button" role="tab" onClick={onChange && onChange.bind(null, viewData.targetId)}>{viewData.label}</button>
                            </li>
                })
            }
        </ul>
    )
};

export default TabBar;
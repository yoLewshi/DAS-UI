import React from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function PermissionFailed(props) {

    const {cssClasses} = props || [];

    return (
        <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-8", "offset-2"])}>
                        <div className={cx(["permission_failed"].concat(cssClasses))}>
                            <h5>You are missing the required permssion to access this page</h5>
                        </div>
                    </div>
                </div>
        </div>
    )
}

export default PermissionFailed;
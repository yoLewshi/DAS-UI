import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import {getAPI} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';

let cx = classNames.bind(styles);

function CacheViewer() {

    const JSONPlaceholder = "No cache data loaded";
    const [cacheJSON, setCacheJSON] = useState(JSONPlaceholder);

    const { field } = useParams();

    useEffect(onLoad, []);

    function onLoad() {
        getAPI(`/view-cache/${field || ""}`).then((response) => {
            setCacheJSON(response.cache_value);
        });
    }

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-12", "details_col"])}>
                        <pre>{JSON.stringify(cacheJSON, null, 3)}</pre>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CacheViewer;
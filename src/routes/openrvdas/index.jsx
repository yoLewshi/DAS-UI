import React from 'react';

import styles from "./style.module.css";

function OpenRVDAS(props) {

    const {hostname} = props;

    return (  
        <>
            <iframe className={styles.openrvdas_iframe} src={`http://${hostname}/index_native`}/>
        </>
    )
};

export default OpenRVDAS;
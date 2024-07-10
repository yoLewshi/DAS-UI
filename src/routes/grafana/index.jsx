import React from 'react';

import styles from "./style.module.css";

function Grafana(props) {

    const {hostname} = props;

    return (  
        <>
            <iframe className={styles.grafana_iframe} src={`http://${hostname}:2001/d/c98dc609-3a67-4110-bd4b-0beebb36cc66/kah-ii-standard?orgId=1&refresh=30s`}/>
        </>
    )
};

export default Grafana;
import React from 'react';

import styles from "./style.module.css";

function Grafana() {

    return (  
        <>
            <iframe className={styles.grafana_iframe} src={import.meta.env.VITE_GRAFANA_HOMEPAGE}/>
        </>
    )
}

export default Grafana;
import React from 'react';

import styles from "./style.module.css";

function Django() {

    return (  
        <>
            <iframe className={styles.grafana_iframe} src={`${import.meta.env.VITE_DJANGO_SERVER}/admin/`}/>
        </>
    )
}

export default Django;
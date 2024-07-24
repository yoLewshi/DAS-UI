import React, {useContext} from 'react';
import { GlobalContext } from '../../shared_components/globalContext';
import { checkForPermission } from '../../shared_methods/permissions';

import styles from "./style.module.css";

function OpenRVDAS() {
    
    const { global } = useContext(GlobalContext);

    const permissionFailed = checkForPermission(global.permissions, "view_native");
    if(permissionFailed) {
        return permissionFailed
    }

    return (  
        <>
            <iframe className={styles.openrvdas_iframe} src={import.meta.env.VITE_DJANGO_SERVER}/>
        </>
    )
};

export default OpenRVDAS;
import React, {memo, useCallback, useEffect, useState} from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function StatusIndicator(props) {
    const {possibleStatuses, status, explanations, hideBars} = props;
    const cssClasses = props.cssClasses || [];
    const [tooltip, setTooltip] = useState(null);


    
    useEffect(()=> {
        if(tooltip) {
            tooltip.dispose();
            setTooltip(null);
        }
    }, [status])

    function buildStage(name, order) {

        const stageMet = possibleStatuses.indexOf(status) >=  order;
        return <div key={order} className={cx(["stage", {"failed_stage": !stageMet}, "me-2"])}>&nbsp;</div>  
    }

    const ref = useCallback((node) => {
        if(node != null && !tooltip) {
            const tooltipTriggerList = node.querySelectorAll(`.${styles.status_label}[data-bs-toggle="tooltip"]`);
            [...tooltipTriggerList].map(tooltipTriggerEl => {
                setTooltip(bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl));
            })
        }
    });

    return (  
            <div className={cx(["status_indicator", "background_stripes"].concat(cssClasses), {bars_hidden: hideBars})} ref={ref}>
                {!hideBars && <div className={cx("status_blocks")}>{possibleStatuses.map(buildStage)}</div>}
                <div className={cx(["border", "border-dark", "status_label"])} 
                {...(status != "" ? {"data-bs-toggle":"tooltip", "data-bs-placement":"right", "data-bs-title":explanations[status]} : {})}>
                    <div className={cx(["status_inner", status])}>{status}</div>
                </div>
            </div>
            
    )
};

export default memo(StatusIndicator);
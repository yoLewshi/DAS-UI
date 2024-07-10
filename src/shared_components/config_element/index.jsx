import React, {useCallback} from "react";
import {CONFIG_HELP_TEXT} from "../../shared_methods/constants";
var classNames = require("classnames/bind");
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function ConfigElement(props) {

    const {config} = props;

    function isObject(value) {
        return (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        );
    }

    const ref = useCallback((node) => {
        if(node != null) {
            const tooltipTriggerList = node.querySelectorAll(`.${styles.element_description_icon}[data-bs-toggle="tooltip"]`);

            [...tooltipTriggerList].map(tooltipTriggerEl => {
                bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
            })
        }
    });

    function renderDetails(config, depth) {
        // alter the balance of bootstrap columns as it runs out of space
        // only happens for complex classes e.g. interpolation_transform
        let colWidths = [3,9]
        
        if(depth === 2) {
            colWidths = [4,8]
        } else if(depth > 2) {
            colWidths = [5,7]
        }

        if(isObject(config)) {
            return Object.keys(config).map((key, i) => {
                if(key === "class") {
                    const classHelpText = CONFIG_HELP_TEXT[config.class];

                    return <h3 key={i}>{config.class} {classHelpText && <i className={cx(["bi", "bi-question-square-fill", "element_description_icon"])}  data-bs-toggle="tooltip" data-bs-placement="right" data-bs-custom-class={styles.element_description} data-bs-title={CONFIG_HELP_TEXT[config.class]}></i>}</h3>
                } else {
                    return <div className={cx(["row", "config_row"])} key={i}><div className={`col col-${colWidths[0]}`}><b>{key}: </b></div><div className={`col col-${colWidths[1]}`}>{renderDetails(config[key], depth+1)}</div></div>
                }
            })
        } else if(Array.isArray(config)) {
            return config.map((item) => renderDetails(item, depth+1));
        }
        else {
            return config
        }
    }

    return (
        <div className={cx(["element"])} ref={ref}>
            {renderDetails(config, 0)}
        </div>
    )
}

export default ConfigElement;
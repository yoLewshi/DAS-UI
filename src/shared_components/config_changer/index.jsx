import React, {useEffect, useState} from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function ConfigChanger(props) {

    const {options, onSelect, onUpdate} = props;
    const initialValue = props.initialValue || ""; 
    const [selectedValue, setSelectedValue] = useState(initialValue)
    const {cssClasses} = props || [];

    useEffect(()=> {
        setSelectedValue(initialValue);
    }, [initialValue])

    function onChange(event) {
        setSelectedValue(event.target.value);
        onSelect(event.target.value)
    }

    return (  
        <div className="input-group">
            <select className={cx(["form-select", "config_select"].concat(cssClasses))} value={selectedValue} disabled={!options || options.length == 0} onChange={onChange}>
            {
                options.map((optionData, i) => {
                    return <option key={i} value={optionData.value}>{optionData.name}</option>
                })
            }     
            {options.length == 0 && <option>No options available</option>}      
            </select>
            <button className="btn btn-dark" type="button" onClick={onUpdate && onUpdate.bind(null, selectedValue)} disabled={selectedValue == initialValue}>Apply</button>
        </div>
    )
};

export default ConfigChanger;
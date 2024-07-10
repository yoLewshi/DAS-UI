import React, {useState} from 'react';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function FileLoader(props) {

    const {onUpdate} = props;
    const {cssClasses} = props || [];
    const [file, setFile] = useState(null)

    function onChange(event) {
        setFile(event.target.files[0]);
    }

    function onClick(event) {
        onUpdate(file);
    }

    return (  
        <div className={cx(["input-group"].concat(cssClasses))}>
            <input className="form-control" type="file" id="formFile" onChange={onChange}/>
            <button className="btn btn-dark" type="button" onClick={onClick} disabled={!file}>Upload</button>
        </div>
    )
};

export default FileLoader;
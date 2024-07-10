import React, {useState} from 'react';
import { MonacoDiffEditor} from 'react-monaco-editor';
import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function YamlEditor(props) {
    const { editorRef, fileContent, onChange } = props;

    const [changes, setChanges] = useState([]);
    const defaultEditorOptions = {
        automaticLayout: true,
        minimap: {
            enabled: true,
            autohide: false
        },
        renderSideBySide: false
    };

    const editorOptions = Object.assign(defaultEditorOptions, props.editorOptions || {});

    function updateChanges(e) {
        const changedLines = editorRef.current.getLineChanges();
        setChanges(changedLines);

        if(onChange) {
            onChange(e);
        }
    }
    
    return (
        <>
            <div className={cx(["change_label"])}>Changes made: <b>{changes.length}</b></div>
            <MonacoDiffEditor
                language="yaml"
                theme="vs"
                original={fileContent}
                value={fileContent}
                options={editorOptions}
                onChange={updateChanges}
                editorDidMount={(component) => editorRef.current = component}
            />
        </>
    )
};

export default YamlEditor;
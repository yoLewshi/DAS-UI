import React, {useState} from 'react';
import {DiffEditor} from '@monaco-editor/react';

import Loader from '../loader';

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

    function onMount(component) {
        editorRef.current = component;
        component.onDidUpdateDiff(updateChanges);
    }

    
    return (
        <>
            <div className={cx(["change_label"])}>Changes made: <b>{changes.length}</b></div>
            <DiffEditor
                language="yaml"
                theme="vs"
                loading={<Loader />}
                original={fileContent}
                modified={fileContent}
                options={editorOptions}
                onMount={onMount}
            />
        </>
    )
};

export default YamlEditor;
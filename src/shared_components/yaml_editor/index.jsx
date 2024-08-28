import React, {useContext, useState} from 'react';
import {DiffEditor} from '@monaco-editor/react';
import { GlobalContext } from '../../shared_components/globalContext';

import Loader from '../loader';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function YamlEditor(props) {
    const { editorRef, fileContent, onChange } = props;

    const { global } = useContext(GlobalContext);
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
                theme={global.theme == "default" ? "vs" : "vs-dark"}
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
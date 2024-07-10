import React, {useEffect, useState} from 'react';
import ConfigElement from '../../shared_components/config_element';
import DASTable from '../../shared_components/das_table';
import Panel from "../../shared_components/panel";
import TabBar from '../../shared_components/tab_bar';
import {getAPI} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

function LoggerConfig(props) {

    const { loggerName } = props;

    const [tabViews, setTabViews] = useState([]);
    const [config, setConfig] = useState({});
    const [selectedConfig, setSelectedConfig] = useState({});
    const [definitionRows, setDefinitionRows] = useState([]);

    function getLoggerConfig(callback) {
        return getAPI(`/logger/get_config/${loggerName}`, callback)
    }

    useEffect(() =>{
        getLoggerConfig(parseConfig);
    }, [])

    function parseConfig(loggerConfig) {
        setConfig(loggerConfig);
        setSelectedConfig(loggerConfig.fullConfig[loggerConfig.selectedConfig]); 
        buildTabs(loggerConfig);
        buildDefinitionFileTable(loggerConfig);
    }

    function buildTabs(loggerConfig) {
        setTabViews(Object.keys(loggerConfig.fullConfig).map((configName) => {
            
            return {
                active: configName === loggerConfig.selectedConfig,
                highlight: configName === loggerConfig.selectedConfig,
                label: configName,
                targetId: configName
            }
        }));
    }

     function onTabChange(targetId) {      
        setSelectedConfig(config.fullConfig[targetId]); 
     }

     function buildDefinitionFileTable(loggerConfig) {
        setDefinitionRows(loggerConfig.definitionFiles.map((fileInfo) => { return [fileInfo.filename,(<><i className="bi bi-pencil-square"></i></>)]; }));
     }

     function renderSection(configSection, sectionType) {
        if(configSection) {
            return configSection.map((config, i) => <ConfigElement config={config} key={i}/>)
        } else {
            return<div className={cx(["empty_section"])}>No <b>{sectionType}</b> defined in this config</div>
        }
     }

     function openDefinition(row) {
        window.open(`/edit_yaml?file=${row[0]}`, "_blank")
     }

     const headerContent = function() {
        return (
            <div className={cx(["card-header", "bg-transparent", "header"])}>
                <h2 className={cx(["text-bg-dark", "logger_name"])}>{loggerName || '\u00A0'}</h2>
                <TabBar views={tabViews} onChange={onTabChange} singleTabPane={true} cssClasses={[styles.tabs]}/>
            </div>
        )
    }

    const helpText = <>
        <p>
            A <b>Logger</b> must have at least one <b>Reader</b> to provide data. The data is then passed through 
            any <b>Transforms</b> which alter it before it is sent in parallel to any <b>Writers</b>.
        </p>
        <p>
            Some elements such as <b>ComposedWriter</b> allow transforms to be applied only to that writer without changing the format of the data for others.<br/>
            <br/>
            <b>Note:</b> All loggers combine their transforms and writers into one <b>ComposedWriter</b> when they run.
        </p>
    </>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "col-2", "col-md-3", "d-none", "d-xl-block"])}>
                        <DASTable headers={["Definition Files", <>&nbsp;</>]} rows={definitionRows} onClick={openDefinition} cssClasses={styles.definition_table}/>
                    </div>
                    <div className={cx(["col", "col-12", "col-md-6", "col-xl-7", "middle_col"])}>
                        <Panel showHeader={true} customHeader={headerContent} cssClasses={cx(["details_panel", "w-100"])}>
                            <div id="ConfigTab" className={cx(["container-fluid", "tab-pane", "active", "config_tab"])} role="tabpanel">
                                <div className="row">
                                    <div className="col col-12">
                                        {renderSection(selectedConfig.readers, "Readers")}
                                        {renderSection(selectedConfig.transforms, "Transforms")}
                                        {renderSection(selectedConfig.writers, "Writers")}
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                    <div className={cx(["col", "col-2", "d-none", "d-xl-block"])}>
                        <Panel showHeader={false} cssClasses={cx(["help_panel", "w-100"])}>
                            {helpText}
                        </Panel>
                    </div>
                </div>
            </div>
        </>
    )
};

export default LoggerConfig;
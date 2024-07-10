import React, {useCallback, useRef, useState, memo, useEffect} from 'react';
import DASTable from '../../shared_components/das_table';
import {websocket} from "../../shared_methods/websocket";


import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function FieldTable(props) {

    const {fields, loading} = props;
    const [showLoader, setShowLoader] = useState(false);
    const [fieldRows, setFieldRows] = useState([]);
    const [examples, setExamples] = useState({});
    const [deviceType, setDeviceType] = useState(null);
    const [ws, setWs] = useState(null);
    
    const exampleWait = 30 * 1000;
    const lastExampleTime = useRef(Date.now() - exampleWait);

    useEffect(() => {
        setWs(websocket());
    }, [])

    useEffect(() => {
        if(fields && fields.length) {
            getFieldExamples();
            setDeviceType(fields[0].device_type);
        }
        else
        {
            setDeviceType(null);
        }
    }, [fields])

    useEffect(() => {
        if(loading) {
            setShowLoader(true);
        }else
        {
            setTimeout(setShowLoader.bind(null, false), 300);
        }
    }, [loading])

    const tableRef = useCallback((node) => {
        if(node != null) {
            const tooltipTriggerList = node.querySelectorAll(`.${styles.field_description}[data-bs-toggle="tooltip"]`);

            [...tooltipTriggerList].map(tooltipTriggerEl => {
                bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
            })
        }
    });

    const headers = ["Field name", "Recent Data", "Units", <>&nbsp;</>];
    useEffect(() => {
        setFieldRows(fields.map((field) => {
            return [
                field.device_type_field, 
                examples[field.device_type_field] || <>&nbsp;</>,
                field.units, 
                field.description ? <i className={cx(["bi", "bi-question-square-fill", "field_description"])}  data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title={field.description}></i> : <>&nbsp;</>
            ]
        }));
    }, [fields, examples]);


    function getFieldExamples() {
         try {
            ws.reload(buildSubscribeMessage, processMessage, () => true, () => {
            });
        } catch (e) {
            console.error(e);
        }
    }

    function buildSubscribeMessage() {

        const fieldDict = fields.reduce((agg, field) => {
            agg[field.device_type_field] = {
                'seconds': 30,
                'back_records': 1,
            }

            return agg
        }, {});

        return {
                'type':'subscribe',
                'interval': 1,
                'fields': fieldDict
            }
    }

    function processMessage(message){
        ws.processResponse(message, parseSocketResponse);
    }

    function parseSocketResponse(message, messageType) {
        // messages are throttled so they don't constantly update for more frequent loggers
        // this does mean things like the event log aren't updated unless the return falls at the time messages are being accepted
        if(message) {
            const timeNow = Date.now();
            if(lastExampleTime.current < (timeNow - exampleWait)) {
                fields.map((field) => {
                    const returnedData = message[field.device_type_field];

                    if(returnedData && returnedData.length) {
                        const value = returnedData.pop()[1];
                        examples[field.device_type_field] = value;
                    }
                });

                lastExampleTime.current = timeNow;
                setExamples(Object.assign({}, examples));
            }
        }
    }

    return (
        <>
            <div className={cx(["pb-1", "device_type"])}>{deviceType ? <>Device type: <b>{deviceType}</b></> : <>&nbsp;</> }</div> 
            <DASTable headers={headers} rows={fieldRows} tableRef={tableRef} cssClasses={[styles.fields_table]} showLoader={showLoader} loading={loading} showEmptyMessage={!loading}/>  
        </>
    )
}

// memo used to stop re-render when logs change on logger_details view
const FieldTableMemo = memo(FieldTable, (prevProps, currentProps) => {
    const prevFieldNames = prevProps.fields.map((field) => field.device_type_field);
    let isSame = prevProps.fields.length === currentProps.fields.length;

    if(isSame) {
        currentProps.fields.map((field) => {
            if(!prevFieldNames.includes(field.device_type_field)) {
                isSame = false;
            }
        });
    }

    return isSame;
})
export default FieldTableMemo;
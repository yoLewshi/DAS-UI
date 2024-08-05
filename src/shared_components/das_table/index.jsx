import React, {useState} from 'react';
import Loader from '../loader';

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function DASRow(props) {
    const {row, onClick, showSelected, selected} = props;
    const {highlight} = props || false;
    const cssClasses = props.cssClasses || [];

    return (  
        <tr className={cx([styles.row, {"table-active": highlight}].concat(cssClasses))} onClick={onClick}>    
            {
                showSelected && <td className={cx(["select_cell"])}><div>{selected ? <i className="bi bi-caret-right-fill"></i> : '\u00A0'}</div></td>
            }       
            {row.map((col, i) => {
                return <td key={i}>{col && <div>{col}</div>}</td>
            })}
        </tr>
    )
};


function DASTable(props) {

    const {headers, rows, highlightFn, classesFn, tableRef, showEmptyMessage, showLoader, showSelected, loading, firstSelected} = props;
    const cssClasses = props.cssClasses || [];
    const onClick = props.onClick || function (){};

    const [selectedRow, setSelectedRow] = useState(firstSelected);

    function rowSelected(row, key) {
        
        if(showSelected) {
            setSelectedRow(key);
        }
        
        if(onClick) {
            onClick(row);
        }
    }

    return (
        <div className={cx(["DAS_table", {"empty": showEmptyMessage && rows.length == 0}].concat(cssClasses))}>
            <table className={cx(["table", "table-borderless", "table-sm", "table-hover", "table-responsive"])} ref={tableRef}>
                <thead className={cx(["table-dark", "sticky-top"])}>
                    <tr>
                        {
                            showSelected && (<th className={cx(["select_cell"])}><i className="bi bi-caret-right-fill"></i></th>)
                        }
                        {headers.map((header, i) => <th key={i}>{header}</th>)}
                    </tr>
                </thead>
                <tbody className={cx([{"loading": loading, "selectable": showSelected}])}>
                    {showLoader && <Loader hidden={!loading}/>}
                    {
                        !loading && rows.map((row, i) => {
                            return <DASRow row={row} key={i} onClick={rowSelected.bind(null, row, i)} 
                            {...(highlightFn ? {highlight: highlightFn(row)} : {})} 
                            {...(classesFn ? {cssClasses: classesFn(row)} : {})}
                            showSelected={showSelected} selected={selectedRow == i}/>
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}

export default DASTable;
import React, {useContext, useState} from 'react';
import { addMessage, GlobalContext } from '../../shared_components/globalContext';
import {getAPI, postAPI} from '../../shared_methods/api';

import styles from "./style.module.css";
import classNames from 'classnames/bind';
import { checkForPermission } from '../../shared_methods/permissions';
let cx = classNames.bind(styles);

function TripManager() {
    const { setMessages, messagesRef, global } = useContext(GlobalContext);

    const [tripData, setTripData] = useState({});
    const [changes, setChanges] = useState({});
    const [status, setStatus] = useState("");

    const permissionFailed = checkForPermission(global.permissions, "manage_trip");
    if(permissionFailed) {
        return permissionFailed
    }

    function setTripDataState(key, event) {
        setTripData((oldValue) => {
            oldValue[key] = event.target.value;
            return Object.assign({}, oldValue);
        });
        
        setChanges((oldValue) => {
            oldValue[key] = true;
            return Object.assign({}, oldValue);
        });

        setStatus("");
    }

    function updateTrip () {
        if(tripData.trip_code) {
            postAPI(`/trip-data/${tripData.trip_code}`, tripData, onTripDataChanged)
        } else {
            addMessage(messagesRef, setMessages, "No trip code entered", "error");
        }
    }

    function onTripDataChanged(response) {
        if(response.APIMeta.status === 200) {
            addMessage(messagesRef, setMessages, response.message, response.errors ? "error" : undefined);
        
            if(!response.errors) {
                setChanges({});
            }
        } else {
            addMessage(messagesRef, setMessages, [response.message].concat(response.errors), "error");
        }
    }

    function getTripData() {
        if(tripData.trip_code) {
            return getAPI(`/trip-data/${tripData.trip_code}`, parseTripData);
        } else {
            addMessage(messagesRef, setMessages, "No trip code entered", "error");
        }
    }

    function parseTripData(response) {
        if(response.APIMeta.status === 200) {

            if(response.trip_data?.trip_code) {
                setStatus("Trip code exists");
            } else {
                setStatus("New trip code");
            }

            const formattedTripData = Object.assign({}, response.trip_data, {trip_code: tripData.trip_code});
            formattedTripData.start_date = formattedTripData.start_date ? formattedTripData.start_date.split("T")[0] : '';
            formattedTripData.end_date = formattedTripData.end_date ? formattedTripData.end_date.split("T")[0] : '';

            setTripData(formattedTripData);
        }
    }

    function checkSubmit(event) {
        if(event.key === "Enter") {
            getTripData();
        }
    }

    function renderInput(key, label, charLimit, placeholder) {
        return (
            <div className={cx(["input-group", "mb-3", "input", {"long-text": ["name", "notes"].includes(key)}])}>
                <span className="input-group-text">{label}</span>
                {["notes"].includes(key) ?
                <textarea type="text" id={`${key}Input`} className="form-control" maxLength={charLimit || 32} onChange={setTripDataState.bind(null, key)} value={tripData[key]} placeholder={placeholder} rows="5"></textarea>
                : <input type="text" id={`${key}Input`} className="form-control" maxLength={charLimit || 32} onChange={setTripDataState.bind(null, key)} value={tripData[key]} placeholder={placeholder}></input>
                }
            </div>
        )
    }

    const helpText = <>Enter a <b>Trip code</b> to load existing data and make changes. Anything you save from here will overwrite the database or create a new trip row if the code doesn't exist.</>

    return (  
        <>
            <div className={cx(["container-fluid", "grid"])}>
                <div className="row">
                    <div className={cx(["col", "offset-lg-2", "col-lg-8", "offset-xxl-3", "col-xxl-6", "trip-col"])}>
                        <h3 className="pb-3">Trip data</h3>
                        <div className="row"><p>{helpText}</p></div>
                        <div className="row">
                            <div className={cx(["input-group", "mb-3", "input", "trip-code"])}>
                                <span className="input-group-text">Trip code</span>
                                <input type="text" id="TripCodeInput" className="form-control" maxLength="32" onChange={setTripDataState.bind(null, "trip_code")} defaultValue={tripData.trip_code} onKeyUp={checkSubmit}></input>
                                <button className="btn btn-dark" type="button" onClick={getTripData} disabled={!changes.trip_code}>Load trip</button>
                            </div>
                            <div className={cx(["pt-2", "trip-status"])}>{status && <b>{status}</b>}</div>
                        </div>
                        <div className="row">
                            {renderInput("name", "Voyage name", 511)}
                        </div>
                        <div className="row">
                            {renderInput("start_date", "Start date", 10, "YYYY-MM-DD")}
                            {renderInput("end_date", "End date", 10, "YYYY-MM-DD")}
                        </div>
                        <div className="row">
                            {renderInput("notes", "Notes", 255)}
                        </div>
                        <div className="row">
                            {renderInput("leader", "Voyage leader", 1023)}
                            {renderInput("project_code", "Project code", 255)}
                        </div>
                        <div className={cx(["button-row"])}>
                            <button className="btn btn-dark" type="button" onClick={updateTrip} disabled={!Object.keys(changes).length}>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default TripManager;
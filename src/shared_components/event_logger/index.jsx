import React, {useContext, useEffect, useState} from 'react';
import LogViewer from '../log_viewer';
import { addMessage, GlobalContext } from '../globalContext';
import {websocket} from "../../shared_methods/websocket";

import classNames from 'classnames/bind';
import styles from "./style.module.css";
let cx = classNames.bind(styles);

function EventLogger(props) {

    const {panelId} = props;

    const maxCharacters = 40;
    const [ws, setWs] = useState(null);
    const [charactersLeft, setCharactersLeft] = useState(maxCharacters);
    const [logOutput, setLogOutput] = useState([]);
    const { setMessages, messagesRef } = useContext(GlobalContext)

    function buildSubscribeMessage() {
        return {
                'type':'subscribe',
                'interval': 1,
                'fields': {                  
                            'EventsLog':{
                                'seconds': 300,
                                'back_records': 10,
                            }
                }
            }
    }

    function subscribeToEvents() {
        try {
            ws.reload(buildSubscribeMessage, processMessage, () => true, () => {
            });
        } catch (e) {
            console.error(e);
        }
        
    }

    function processMessage(message){
        ws.processResponse(message, parseSocketResponse);
    }

    function parseSocketResponse(message, messageType) {
        
        if(message) {
            const returnedData = message['EventsLog'];

            if(returnedData) {
                const formattedWithTimestamp = returnedData.map((row) => {
                    const formattedTime = (new Date(row[0] * 1000)).toUTCString();
                    return [row[0], `${formattedTime}: ${row[1]}`];
                })
                setLogOutput(formattedWithTimestamp);
            }
        }
    }

    function submitEvent() {
        const eventInput = document.querySelector("#EventInput");
        
        const message = {
            'type':'publish', 
            'data':{
                'timestamp':(new Date()).getTime() / 1000,                
                'fields':{
                    'EventsLog':eventInput.value,
                }
            }
        }

        ws.send(message);
        eventInput.value = "";
        setCharactersLeft(maxCharacters);
        addMessage(messagesRef, setMessages, "Event sent");
    }

    function updateCharacters(event){
        const charsLeft = maxCharacters - event.target.value.length || 0;
        setCharactersLeft(charsLeft);
    }

    function onKeyDown(event) {
        if(event.key === "Enter") {
            submitEvent();
        }
    }

    useEffect(() => {
        setWs(websocket());
    }, [])

    useEffect(() =>{
        if(ws) {
            subscribeToEvents();
        }
    }, [ws])


    return (
        <div className="offcanvas offcanvas-end" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" id={panelId}>
            <div className="offcanvas-header">
                <h5 className="offcanvas-title">Log Event</h5>
                <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <p>This text will be read by the <b>Events</b> logger if it is active and written to the database if the <b>DASDB</b> logger is active.</p>
                <p>The time recorded is when the <b>Submit</b> button is clicked.</p>
                <div className={cx(["event_input", "input-group"])}>
                    <span className="input-group-text">Event Text</span>
                    <input type="text" id="EventInput" className="form-control" maxLength="40" onInput={updateCharacters} onKeyDown={onKeyDown}></input>
                </div>
                <div className={cx(["under_input"])}>
                    <div className={cx(["character_count"])}>{charactersLeft}</div>
                    <button className={cx(["submit_button", "btn", "btn-dark"])} type="button" onClick={submitEvent}>
                            Submit
                    </button>
                </div>
                <h5 className="mt-2">Last Logged Events</h5>
                <LogViewer loggerName={"EventLogger"} loggerOutput={logOutput} linesToKeep={30} cssClasses={["pb-2", "mt-2"]} showControls={false}/>
            </div>
        </div>
    )
};

export default EventLogger;

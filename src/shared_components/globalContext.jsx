import React, { createContext, useEffect, useRef, useState } from 'react'
import { getAPI } from '../shared_methods/api';

export const GlobalContext = createContext()

// use object to retrieve messages by key
const initialState = {}

export function addMessage(messagesRef, setFn, messageContent, messageType) {
    const randomId = Math.random();
    messagesRef.current[randomId] = {content: messageContent, type: messageType};
    setFn(Object.assign({}, messagesRef.current));
}

export function GlobalProvider(props) {

	const [global, setGlobal] = useState({});
	const [messages, setMessages] = useState(initialState);
	const messagesRef = useRef(initialState);

	function getAuthDetails() {
		getAPI("/get-auth-user").then((response) => {
				if(response?.user) {
				const updatedProps = Object.assign({}, global, {username: response.user.username, permissions: response.user.user_permissions});
				setGlobal(updatedProps);
			}
		})
	}

	useEffect(getAuthDetails, []);

	return (
		<GlobalContext.Provider value={{ messages, setMessages, messagesRef, global, setGlobal}}>
			{props.children}
		</GlobalContext.Provider>
	)
}
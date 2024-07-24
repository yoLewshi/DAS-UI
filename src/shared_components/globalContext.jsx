import React, { createContext, useEffect, useRef, useState } from 'react'
import { getAPI } from '../shared_methods/api';
import { getValue, setValue } from '../shared_methods/cache';

export const GlobalContext = createContext()

// use object to retrieve messages by key
const initialState = {}

export function addMessage(messagesRef, setFn, messageContent, messageType) {
    const randomId = Math.random();
    messagesRef.current[randomId] = {content: messageContent, type: messageType};
    setFn(Object.assign({}, messagesRef.current));
}

let connectionInterval;

export function GlobalProvider(props) {
	
	// to avoid nav UI initializing empty the cached user is first used then updated by API call
	const cachedUser = getValue("user");
	const cachedIP = getValue("clientIP");

	const [global, setGlobal] = useState({
			username: cachedUser?.value?.username, 
			permissions: cachedUser?.value?.user_permissions.reduce((agg, permission) => {
				agg[permission.codename] = permission;
				return agg;
			}, {}),
			superuser: cachedUser?.value?.is_superuser,
			clientIP: cachedIP?.value
		});
	const [messages, setMessages] = useState(initialState);
	const messagesRef = useRef(initialState);

	clearInterval(connectionInterval);
	connectionInterval = setInterval(checkAPIConnection, 20 * 1000);

	const acceptableTimeout = 10 * 1000; // 10 seconds

	function checkAPIConnection() {
		const websocketState = getValue("websocketState");
		const websocketOK = websocketState?.value == "connected" && websocketState?.created > ((new Date()).getTime() - acceptableTimeout);

		setGlobal((prevValue) => {
			return Object.assign({}, prevValue, {
				connection: {
					websocket: websocketOK,
				}
			})
		})
	}

	function getClientIP() {
		getAPI("/get-client-ip").then((response) => {
				if(response?.ip_address) {
					const updatedProps = Object.assign({}, global, 
						{
							clientIP: response.ip_address
						});
					setGlobal(updatedProps);
					setValue("clientIP", response.ip_address);
				}
		})
	}

	function getAuthDetails() {
		getAPI("/get-auth-user").then((response) => {
				if(response?.user) {
					const updatedProps = Object.assign({}, global, 
						{
							username: response.user.username, 
							permissions: response.user.user_permissions.reduce((agg, permission) => {
								agg[permission.codename] = permission;
								return agg;
							}, {}),
							superuser: response.user.is_superuser
						});
					setGlobal(updatedProps);
					setValue("user", response.user);
				}
		})
	}

	function onRender() {
		getAuthDetails();
		getClientIP();
		checkAPIConnection();
	}

	useEffect(onRender, []);

	return (
		<GlobalContext.Provider value={{ messages, setMessages, messagesRef, global, setGlobal}}>
			{props.children}
		</GlobalContext.Provider>
	)
}
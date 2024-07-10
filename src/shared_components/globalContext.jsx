import React, { createContext, useRef, useState } from 'react'

export const GlobalContext = createContext()

// use object to retrieve messages by key
const initialState = {}

export function addMessage(messagesRef, setFn, messageContent, messageType) {
    const randomId = Math.random();
    messagesRef.current[randomId] = {content: messageContent, type: messageType};
    setFn(Object.assign({}, messagesRef.current));
}

export function GlobalProvider(props) {

	const {global} = props;
	const [messages, setMessages] = useState(initialState);
	const messagesRef = useRef(initialState);

	return (
		<GlobalContext.Provider value={{ messages, setMessages, messagesRef, global}}>
			{props.children}
		</GlobalContext.Provider>
	)
}
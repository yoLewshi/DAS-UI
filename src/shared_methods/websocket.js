import { setValue } from "./cache";

//////////////////////////////////////////////////////////////////////////////
// Connect to a websocket server to request data from it.
//
// Typical invocation will look like:
//
//    <script type="text/javascript">
//      // Need to define for following JS scripts. For now, count on the
//      // relevant variables being set by Django.
//      var WEBSOCKET_SERVER = "{{ websocket_server }}";
//    </script>
//
//    <script src="/static/django_gui/index.html.js"></script>
//    <script src="/static/django_gui/websocket.js"></script>
//
// Relies on initial_send_message() and process_message() being defined
// by a previous script (in this// case index.html.js), where
// initial_send_message() should return a CachedDataServer command that
// will initiate receipt of the desired data, and process_message(mesg)
// will be called on the data received from that initial message and
// future messages.
//

const websocket = (function() {
  let ws;
  ////////////////////////////////////////////////////////////////////////////////
  var websocket_server = import.meta.env.VITE_WEBSOCKET_SERVER;
  // It's possible that we get an empty hostname, e.g. 'wss://:8000/cds-ws
  if (websocket_server.indexOf('//:') > 0) {
    websocket_server = websocket_server.replace('//:', '//' + location.hostname + ':');
    // switch to below when debugging from vscode
    //websocket_server = "ws://localhost:8766";
  }

  //////////////////////////////////////////////////////////////
  if (! "WebSocket" in window) {
    alert("Warning: websockets not supported by your Browser!");
  }

  // Set timer to retry websocket connection if it closes. Interval is
  // turned off in ws.onopen() if/when we succeed.
  const retry_interval = 3000;
  let retry_websocket_connection;

  //////////////////////////////////////////////////////
  function connectWebsocket(initial_send_message, process_message, sendReady) {
    if(!websocket_server) {
      console.debug("No websocket server specified, aborting connection");
      return
    }

    console.debug("Trying to connect to websocket at " + websocket_server);

    ws = new WebSocket(websocket_server);
    ws.onerror = function() {
      setValue("websocketState", "failed");
    }
    ws.onopen = function() {
      // We've succeeded in opening - don't try anymore
      console.debug("Connected - clearing retry interval");
      clearTimeout(retry_websocket_connection);
      // Send our first message to get things going.
      var initial_message = initial_send_message();
      send(initial_message);
    }
    ws.onclose = function() { 
      // websocket is closed.
      console.debug("Connection is closed...");
      // Set up an alarm to sleep, then try re-opening websocket
      console.debug("Setting timer to reconnect");
      retry_websocket_connection = setTimeout(connectWebsocket.bind(this, initial_send_message, process_message, sendReady),
                                              retry_interval);
    };

    if(ws) {
      ws.onmessage = function (received_message) { 
        setValue("websocketState", "connected");
        //console.debug("Got status update message: " + received_message.data);
        process_message(received_message.data);
        //console.debug('done processing message');
        // run callback to avoid constantly sending ready after one time messages
        const messageObj = JSON.parse(received_message.data);
        if(sendReady(messageObj) && messageObj.status == 200) {
          send({'type':'ready'})
        }
      };
    }

    return ws;
  };

  window.onbeforeunload = function(event) {
    console.debug("Closing websocket");
    ws.close();
  };

  function send(message) {
    //console.debug("Sending message '" + JSON.stringify(message) + "'");
    ws.send(JSON.stringify(message));
  };

  function sendLastMessage(message, callback) {
    // callback used to chain a reload after a message is sent, it will ignore future messages
    
    if(ws) {
      const oldOnMessage = ws.onmessage;
      ws.onmessage = (message) => {
        oldOnMessage(message);
        callback(message);
        ws.onmessage = oldOnMessage;
      }

      send(message);
    }
  }


  function processResponse(message, parseFn){
      // Just for debugging purposes
    var messageObj = JSON.parse(message);
    //console.debug(messageObj)
    // Figure out what kind of message we got
    var message_type = messageObj.type;
    var status = messageObj.status;

    // If something went wrong, complain, and let server know we're ready
    // for next message.
    if (status != 200) {
      console.debug('Error from server: ' + message);
      return;
    }
    // Now go through all the types of messages we know about and
    // deal with them.
    switch (message_type) {
      case 'describe':
      case 'data':
      case 'publish':
      case 'fields':
        //console.debug('Got data message. Processing...');
        parseFn(messageObj.data, message_type);
        break;

      case 'subscribe':
        if (status != 200) {
          console.debug('Subscribe request failed: ' + message);
        } else {
          //console.debug('Subscribe request successful');
        }
        break
      case undefined:
        console.debug('Error: message has no type field: ' + message);
        break;
      default:
        console.debug('Error: unknown message type "' + message_type + '"');
    }
  }

  function parseLogLine(logLine){
      if(logLine) {
          return logLine.split("\n");
      }

      return [];
  }

  function reload(initialMessageFn, process_message, sendReady, afterFirstMessage){
    // return ws;
    // don't retry connecting on close
      if(ws) {
          ws.onclose = ()=>{};
          clearTimeout(retry_websocket_connection);
          ws.close()
      }

      ws = connectWebsocket(initialMessageFn, process_message, sendReady);

      if(ws) {
        const oldOnMessage = ws.onmessage;
        ws.onmessage = (message) => {
          oldOnMessage(message);
          afterFirstMessage(message);
          ws.onmessage = oldOnMessage;
        }
      }
      
      return ws;
  }

  return {
      connectWebsocket,
      parseLogLine,
      processResponse,
      reload,
      send,
      sendLastMessage
  }
});

export {websocket};
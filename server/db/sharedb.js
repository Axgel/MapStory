const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const sharedb = require('sharedb');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');

const uri = process.env.DB_CONNECT;
const db = require('sharedb-mongo')(uri);
const backend = new sharedb({db});

//const backend = new sharedb();

const app = express();
const server = http.createServer(app);
const webSocketServer = new WebSocket.Server({server: server});

webSocketServer.on('connection', (webSocket) => {
  const stream = new WebSocketJSONStream(webSocket);
  backend.listen(stream);
});

server.listen(5050, () => console.log("WS Server running on port 5050!"));

// This was in the mongo server and the mongodb became localhost
// The reconnecting websocket would be the IP address with the correct port number

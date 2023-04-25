const http = require('http');
const https = require('https');
const fs = require("fs");
const express = require('express');
const WebSocket = require('ws');
const sharedb = require('sharedb');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const json1 = require('ot-json1');
sharedb.types.register(json1.type);


const app = express();
const backend = new sharedb();
let webSocketServer;
const PORT = 6000;
switch (process.env.ENVIRONMENT) {
  case "PRODUCTION":
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync("/home/ubuntu/Keys/privkey.pem"),
        cert: fs.readFileSync("/home/ubuntu/Keys/fullchain.pem"),
      },
      app
    );
    webSocketServer = new WebSocket.Server({server: httpsServer});

    webSocketServer.on('connection', (webSocket) => {
      const stream = new WebSocketJSONStream(webSocket);
      backend.listen(stream);
    });
    httpsServer.listen(PORT, () =>
      console.log(`WS Server running on port ${PORT}`)
    );
    break;
  default:
    const httpServer = http.createServer(app);
    webSocketServer = new WebSocket.Server({server: httpServer});

    webSocketServer.on('connection', (webSocket) => {
      const stream = new WebSocketJSONStream(webSocket);
      backend.listen(stream);
    });
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    break;
}

// This was in the mongo server and the mongodb became localhost
// The reconnecting websocket would be the IP address with the correct port number

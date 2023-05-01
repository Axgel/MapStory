// THESE ARE NODE APIs WE WISH TO USE
const app = require('./app')
const http = require("http");
const https = require("https");
const fs = require("fs");
const { WebSocketServer } = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');


// CREATE OUR SERVER
const PORT = 4000;
switch (process.env.ENVIRONMENT) {
  case "PRODUCTION":
    const httpServer = http.createServer(app);
    const httpsServer = https.createServer(
      {
        key: fs.readFileSync("/home/ubuntu/Keys/privkey.pem"),
        cert: fs.readFileSync("/home/ubuntu/Keys/fullchain.pem"),
      },
      app
    );
    
    const wssServer = new WebSocketServer({server: httpsServer})

    wssServer.on('connection', (socket) => {
      console.log('WebSocket client connected');
    
    
      socket.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
    httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const httpWSServer = http.createServer(app);

    const wsServer = new WebSocketServer({server: httpWSServer})

    wsServer.on('connection', (socket) => {
      console.log('WebSocket client connected', socket);
    
    
      socket.on('close', () => {
        console.log('WebSocket client disconnected');
      });
    });

    httpWSServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
    break;
  }

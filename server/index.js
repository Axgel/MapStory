// THESE ARE NODE APIs WE WISH TO USE
const app = require("./app");
const http = require("http");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const Y = require("yjs");
const WebSocket = require('ws')
const {v4: uuidv4} = require('uuid');

const mapProjects = {};

// CREATE OUR SERVER
const PORT = 4000;
let socketIO;

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

    
    const wsServer = new WebSocket.Server({server: httpsServer});
    console.log(wsServer.Server);
    wsServer.on('connection', function connection(ws) {
      console.log('A new client Connected!');
    
      ws.on('message', function incoming(message) {
        if(message.toString() == "sync"){
          ws.send("ydoc");
        }
      });
      
      ws.on('close', () => console.log('disconnected'));
    });

    httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
    httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const devHttpServer = http.createServer(app);
    
    // const wsServer = new WebSocket.Server({server: devHttpServer});
    // console.log(wsServer.Server);
    // wsServer.on('connection', function connection(ws) {
    //   console.log('A new client Connected!');
    
    //   ws.on('message', function incoming(message) {
    //     if(message.toString() == "sync"){
    //       ws.send("ydoc");
    //     }
    //   });

    //   ws.on('close', () => console.log('disconnected'));
    // });


    devHttpServer.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
    break;
}

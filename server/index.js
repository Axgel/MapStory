// THESE ARE NODE APIs WE WISH TO USE
const app = require('./app')
const http = require("http");
const https = require("https");
const fs = require("fs");
// const WebSocket = require('ws');
// const ReconnectingWebSocket = require('reconnecting-websocket');
// const sharedb = require('sharedb/lib/client')
const sdb = require("./db/sharedb");

// CREATE OUR SERVER
const PORT = 4000;
let server;

  // const options = {
    //    WebSocket: WebSocket,
    //    connectionTimeout: 1000,
    //    maxRetries: 10,
    // };
    
    // let socket = new ReconnectingWebSocket('ws://localhost:5050', [], options);
    // let connection = new sharedb.Connection(socket);
    // doc = connection.get('documents', "testdocument");
    // doc.subscribe((error) => {
      //   if (error) throw error;
      //   // If doc.type is undefined, the document has not been created, so let's create it
      //   if (!doc.type) {
        //      doc.create([], (error) => {
//         if (error) console.error(error);
//      });
//   };
// });



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
      httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
      httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
      );
      break;
    default:
      server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      break;
    }
    
// async function close_all_connections(){
//   db.close();
//   server.close();
// }
    
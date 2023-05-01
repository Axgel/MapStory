// THESE ARE NODE APIs WE WISH TO USE
const app = require('./app')
const http = require("http");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const Y = require('yjs');

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

    httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
    httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const httpSocketServer = http.createServer(app);

    socketIO = new Server(httpSocketServer, {
      cors: {
        origin: "http://localhost:3000"
      }
    })

    socketIO.on('connection', (socket) => {
      console.log(`${socket.id} user just connected to server!`);

      socket.on('openProject', async (data) => {
        const { mapId } = data;

        if(mapProjects[mapId]){
          // document exists on server
          mapProjects[mapId].clients.push(socket.id);
          let ydoc = mapProjects[mapId].text;
          let state = Y.encodeStateAsUpdate(ydoc);
          let arr = Array.from(state);
          let obj = {
              state: arr
          };
          let str = JSON.stringify(obj);
          socketIO.to(socket.id).emit('sync', str);
        } else {
          let ydoc = new Y.Doc();
          
          console.log("Finding doc in database");
          const allSubregions = await getAllSubregionsServer(mapId);
          if(allSubregions){
            console.log('Found document, applying update');
            let state = allSubregions.subregions;
            let uState = Uint8Array.from(state);
            Y.applyUpdate(ydoc, uState);
          }

          mapProjects[mapId] = {
            text: ydoc,
            clients: [ socket.id ]
          }

          let state = Y.encodeStateAsUpdate(ydoc);
          let arr = Array.from(state);
          let obj = {
            state: arr 
          }
          let str = JSON.stringify(obj);
          socketIO.to(socket.id).emit('sync', str);
        }

        docDict[id].clients.forEach(client => {
          const data = {
            socketId: client
          };
          socketIO.to(socket.io).emit(`user opened ${JSON.stringify(data)}`);
        })

      })

      socket.on('closeProject', async() => {
        for(const mapId in mapProjects) {
          const mapProject = mapProjects[mapId] 
          if(mapProject.includes(socket.io)){
            mapProject.clients = mapProject.clients.filter(socketId => socketId !== socket.id);
            if(mapProject.clients.length === 0){
              console.log("all clients closed, saving to db");
              const uState = Y.encodeStateAsUpdate(mapProject.text);
              const state = Array.from(uState);

              await saveAllSubregions(state);
            }
          }
          
        }
        console.log('User disconnected');
      })    
      
      socket.on('disconnect', async() => {
        for(const mapId in mapProjects) {
          const mapProject = mapProjects[mapId] 
          if(mapProject.includes(socket.io)){
            mapProject.clients = mapProject.clients.filter(socketId => socketId !== socket.id);
            if(mapProject.clients.length === 0){
              console.log("all clients closed, saving to db");
              const uState = Y.encodeStateAsUpdate(mapProject.text);
              const state = Array.from(uState);

              await saveAllSubregions(state);
            }
          }
          
        }
        console.log('User disconnected');
      })    
      
      socket.on('op', (data) => {
        const { arr, mapId } = data;

        let ydoc = mapProjects[mapId].text;
        let uarr = Uint8Array.from(arr);
        Y.applyUpdate(ydoc, uarr);

        let obj = {
          state: arr
        }

        let str = JSON.stringify(obj);
        for(const client of mapProjects[mapId].clients){
          socketIO.to(client).emit(str);
        }
      })
    })
  httpSocketServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
  break;
}

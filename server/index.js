// THESE ARE NODE APIs WE WISH TO USE
const app = require('./app')
const http = require("http");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");

const mapProjects = {};

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
      httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
      httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const httpSocketServer = http.createServer(app);
    const socketIO = new Server(httpSocketServer, {
      cors: {
        origin: "http://localhost:3000"
      }
    })

    socketIO.on('connection', (socket) => {
      console.log(`${socket.id} user just connected to server!`);

      socket.on('openProject', (data) => {
        const { mapId } = data;

        if(mapProjects[mapId]) {
          const clients = mapProjects[mapId].clients;
          clients.push(socket.id)
        } else {
          const mapProject = {version : 1, clients : [socket.id]}
          mapProjects[mapId] = mapProject;
        }
        console.log(mapProjects);
        const version = {version : mapProjects[mapId].version};
        socketIO.to(socket.id).emit('version', version);
      })

      socket.on('closeProject', () => {
        for(const mapId in mapProjects) {
          const mapProject = mapProjects[mapId] 
          mapProject.clients = mapProject.clients.filter(socketId => socketId !== socket.id);
        }
        console.log(mapProjects);
      })

      socket.on('sendOp', async (packet) => {
        const { mapId, subregionId, op, version} = packet;
        console.log("Current Version: " + mapProjects[mapId].version);
        console.log("Incoming Version: " + version);
        if(mapProjects[mapId].version === version) {
          const done = await updateSubregions(subregionId, op);
          if(done) {
            mapProjects[mapId].version += 1
            const clients = mapProjects[mapId].clients;
            const source = socket.id;
            for(const client of clients) {
              if(client === source) {
                socketIO.to(client).emit('owner-ack', {op: op});
              } else {
                socketIO.to(client).emit('others-ack', {op: op});
              } 
            }
          }
        }
      })

      socket.on('disconnect', () => {
        for(const mapId in mapProjects) {
          const mapProject = mapProjects[mapId] 
          mapProject.clients = mapProject.clients.filter(socketId => socketId !== socket.id);
        }
        console.log(mapProjects);
      });
    });

    httpSocketServer.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
    break;
  }

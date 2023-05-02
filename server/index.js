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

    socketIO = new Server(httpsServer, {
      cors: {
        origin: process.env.PROD_CORS
      },
    });

    socketIO.on("connection", (socket) => {
      console.log(`${socket.id} user just connected to server!`);

      socket.on("openProject", async (data) => {
        const { mapId } = data;

        if (mapProjects[mapId]) {
          // another user on
          mapProjects[mapId].clients.push(socket.id);
          let ydoc = mapProjects[mapId].text;
          const ymap = ydoc.getMap("state");
          const tmpItems = ymap.toJSON();
          for (const [k, v] of Object.entries(tmpItems)) {
            ymap.set(k, v);
          }

          let state = Y.encodeStateAsUpdate(ydoc);
          let arr = Array.from(state);
          // let obj = {
          //   state: arr
          // };

          let str = JSON.stringify(arr);
          socketIO.to(socket.id).emit("sync", str);
        } else {
          let ydoc = new Y.Doc();

          const allSubregions = await getAllSubregionsServer(mapId);
          if (allSubregions) {
            let state = allSubregions.subregions;
            const ydoc2 = new Y.Doc();
            const ymap2 = ydoc2.getMap("state");
            for (const [k, v] of Object.entries(state)) {
              ymap2.set(k, JSON.parse(JSON.stringify(v)));
            }

            let uState = Y.encodeStateAsUpdate(ydoc2);
            let uState2 = Uint8Array.from(uState);
            Y.applyUpdate(ydoc, uState2);
          }

          mapProjects[mapId] = {
            text: ydoc,
            clients: [socket.id],
          };

          let state = Y.encodeStateAsUpdate(ydoc);
          let arr = Array.from(state);
          // let obj = {
          //   state: arr
          // }
          let str = JSON.stringify(arr);
          socketIO.to(socket.id).emit("sync", str);
        }

        mapProjects[mapId].clients.forEach((client) => {
          const data = {
            socketId: client,
          };
          // socketIO.to(socket.io).emit('tmp', `user opened ${JSON.stringify(data)}`);
        });
        console.log(`user opened map ${socket.id}`);
      });

      socket.on("closeProject", async () => {
        for (const mapId in mapProjects) {
          const mapProject = mapProjects[mapId];
          if (mapProject.clients && mapProject.clients.includes(socket.io)) {
            mapProject.clients = mapProject.clients.filter(
              (socketId) => socketId !== socket.id
            );
            if (mapProject.clients.length === 0) {
              const uState = Y.encodeStateAsUpdate(mapProject.text);
              const state = Array.from(uState);

              await saveAllSubregions(state);
            }
          }
        }
        console.log(`user closed map ${socket.id}`);
      });

      socket.on("disconnect", async () => {
        for (const mapId in mapProjects) {
          const mapProject = mapProjects[mapId];
          if (mapProject.clients && mapProject.clients.includes(socket.io)) {
            mapProject.clients = mapProject.clients.filter(
              (socketId) => socketId !== socket.id
            );
            if (mapProject.clients.length === 0) {
              const uState = Y.encodeStateAsUpdate(mapProject.text);
              const state = Array.from(uState);

              await saveAllSubregions(state);
            }
          }
        }
        console.log(`user dc`);
      });

      socket.on("op", (data) => {
        const { obj, mapId } = data;
        let ydoc = mapProjects[mapId].text;

        const obj2 = JSON.parse(obj);
        let uarr = Uint8Array.from(obj2);
        Y.applyUpdate(ydoc, uarr);

        const ymap = ydoc.getMap("state");
        const tmpItems = ymap.toJSON();
        for (const [k, v] of Object.entries(tmpItems)) {
          ymap.set(k, v);
        }

        let state = Y.encodeStateAsUpdate(ydoc);
        let arr2 = Array.from(state);
        let str = JSON.stringify(arr2);

        // let obj = {
        //   state: arr
        // }

        // let str = JSON.stringify(obj);

        for (const client of mapProjects[mapId].clients) {
          if (client == socket.id) continue;
          socketIO.to(client).emit("update", str);
        }
      });
    });

    httpServer.listen(80, () => console.log("HTTP Server running on port 80!"));
    httpsServer.listen(443, () =>
      console.log("HTTPS Server running on port 443!")
    );
    break;
  default:
    // server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const devHttpServer = http.createServer(app);
    
    socketIO = new Server(devHttpServer, {
      cors: {
        origin: process.env.DEV_CORS
      }
    })

    socketIO.on("connection", (socket) => {
      console.log(`${socket.id} user just connected to server`);
      socket.on("openProject", async (data) => {
        const { mapId } = data;
        if (mapProjects[mapId]) {
          // another user on
          let str = loadDocFromUser(socket.id, mapId);
          socketIO.to(socket.id).emit("sync", str);
        } else {
          // load from db
          let str = await loadDocFromDb(socket.id, mapId);
          socketIO.to(socket.id).emit("sync", str);
        }
        console.log(`user opened map ${socket.id}`);
      });

      socket.on("closeProject", async () => {
        
      });

      socket.on("disconnect", async () => {
        
      });

      socket.on("op", (data) => {
        const [transaction, mapId, subregionId, indexPath, newCoords] = data;
        let ydoc = mapProjects[mapId].text
        switch(transaction){
          case "MOVE_VERTEX":
            moveVertex(ydoc, subregionId, indexPath, newCoords)
            break;
          case "ADD_VERTEX":
            break;
          case "REMOVE_VERTEX":
            break;
        
        }

        for (const client of mapProjects[mapId].clients) {
          // if (client == socket.id) continue;
          socketIO.to(client).emit("update", data);
        }


        console.log(JSON.stringify(ydoc.getMap("regions")));
      });
    })
   


    devHttpServer.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
    break;
}

function createYjsData(ymap, jsonItems){
  for(const [subregionId, subregionData] of Object.entries(jsonItems)){

    const ymapData = new Y.Map();

    const coords = subregionData["coords"];
    const properties = subregionData["properties"];
    
    const yArr0 = new Y.Array();
    for(let i=0; i<coords.length; i++){
      const yArr1 = [];
      for(let j=0; j<coords[i].length; j++){
        const yArr2 = [];
        for(let k=0; k<coords[i][j].length; k++){
          yArr2.push(coords[i][j][k]);
        }
        yArr1.push(yArr2);
      }
      yArr0.push(yArr1);
    }
    
    ymapData.set("coords", yArr0);
    
    if(properties){
      const pArr = new Y.Array();
      for(const [k,v] of properties){
        pArr.push(k);
        pArr.push(v);
      }
      ymapData.set("properties", pArr);
    }


    ymap.set(subregionId, ymapData);
  }
}

function loadDocFromUser(socketid, mapId){
  mapProjects[mapId].clients.push(socketid);
  let ydoc = mapProjects[mapId].text;
  let state = Y.encodeStateAsUpdate(ydoc);
  let arr = Array.from(state);
  let str = JSON.stringify(arr);
  return str;
}

async function loadDocFromDb(socketid, mapId){
  let ydoc = new Y.Doc();
  const allSubregions = await getAllSubregionsServer(mapId);
  if (allSubregions) {
    let state = JSON.parse(JSON.stringify(allSubregions.subregions));
    const ymap = ydoc.getMap("regions");
    
    createYjsData(ymap, state);
  }

  mapProjects[mapId] = {
    text: ydoc,
    clients: [socketid],
  };

  let state = Y.encodeStateAsUpdate(ydoc);
  let arr = Array.from(state);
  let str = JSON.stringify(arr);
  return str;
}

function moveVertex(ydoc, subregionId, indexPath, newCoords){
  const [i,j] = indexPath
  const ymap = ydoc.getMap("regions");
  const oldCoords = ymap.get(subregionId).get("coords");
  const newCoordsArr = new Y.Array();
  oldCoords.get(i)[j] = newCoords;
  console.log(JSON.stringify(oldCoords), "abc");
  // ymap.set(subregionId, newCoordsArr);
}

function addVertex(ydoc, subregionId, indexPath, newCoords){
  
}

function removeVertex(ydoc, subregionId, indexPath, newCoords){
  
}

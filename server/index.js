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

      socket.on("closeProject", async (data) => {
        const { mapId } = data;
        filterClient(mapId, socket.id);
      });

      socket.on("disconnect", async () => {
        filterClientFromAll(socket.id);
      });

      socket.on("op", (data) => {
        const {mapId, subregionIds, op} = data;
        const parsed = JSON.parse(op);
        const uintArray = Uint8Array.from(parsed);
        const ydoc = mapProjects[mapId].text
        Y.applyUpdate(ydoc, uintArray);
        for (const client of mapProjects[mapId].clients) {
          if (client === socket.id) continue;
          socketIO.to(client).emit('others-update', {subregionIds: subregionIds, op: op});
        }
      });
    })
    

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

      socket.on("closeProject", async (data) => {
        const { mapId } = data;
        filterClient(mapId, socket.id);
      });

      socket.on("disconnect", async () => {
        filterClientFromAll(socket.id);
      });

      socket.on("op", (data) => {
        const {mapId, subregionIds, op} = data;
        const parsed = JSON.parse(op);
        const uintArray = Uint8Array.from(parsed);
        const ydoc = mapProjects[mapId].text
        Y.applyUpdate(ydoc, uintArray);
        for (const client of mapProjects[mapId].clients) {
          if (client === socket.id) continue;
          socketIO.to(client).emit('others-update', {subregionIds: subregionIds, op: op});
        }
      });

    })
   
    devHttpServer.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}`)
    );
    break;
}

function filterClient(mapId, socketId) {
  if(!mapProjects[mapId]) return;
  mapProjects[mapId].clients = mapProjects[mapId].clients.filter(client => client !== socketId);
}

function filterClientFromAll(socketId) {
  for(const mapId in mapProjects) {
    filterClient(mapId, socketId);
  }
}

function createYjsData(ymap, jsonItems){
  for(const [subregionId, subregionData] of Object.entries(jsonItems)){
    const ymapData = new Y.Map();

    const coords = subregionData["coords"];
    const properties = subregionData["properties"];

    const yArr0 = new Y.Array();
    for(let i=0; i<coords.length; i++){
      const yArr1 = new Y.Array();
      for(let j=0; j<coords[i].length; j++){
        const yArr2 = new Y.Array();
        for(let k=0; k<coords[i][j].length; k++){
          yArr2.push([coords[i][j][k]]);
        }
        yArr1.push([yArr2]);
      }
      yArr0.push([yArr1]);
    }
    
    ymapData.set("coords", yArr0);

    const pMap = new Y.Map();
    for(const [k, v] of Object.entries(properties)){
      pMap.set(k, v);
    }
    ymapData.set("properties", pMap);

    ymapData.set("isStale", subregionData["isStale"]);
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

function applyOp(data){
  const [transaction, mapId, subregionId, indexPath, newCoords] = data;
  let ydoc = mapProjects[mapId].text
  switch(transaction){
    case "MOVE_VERTEX":
      moveVertex(ydoc, subregionId, indexPath, newCoords);
      break;
    case "ADD_VERTEX":
      addVertex(ydoc, subregionId, indexPath, newCoords);
      break;
    case "REMOVE_VERTEX":
      removeVertex(ydoc, subregionId, indexPath, newCoords);
      break;
  }
}

function moveVertex(ydoc, subregionId, indexPath, newCoords){
  const [i,j] = indexPath
  const ymap = ydoc.getMap("regions");
  const oldCoords = ymap.get(subregionId).get("coords");
  oldCoords.get(i)[j] = newCoords;
}

function addVertex(ydoc, subregionId, indexPath, newCoords){
  const [i,j] = indexPath;
  const ymap = ydoc.getMap("regions");
  const coords = ymap.get(subregionId).get("coords");
  coords.get(i).splice(j, 0, newCoords);
}

function removeVertex(ydoc, subregionId, indexPath, newCoords){
  const [i,j] = indexPath;
  const ymap = ydoc.getMap("regions");
  const coords = ymap.get(subregionId).get("coords");
  coords.get(i).splice(j, 1);
}

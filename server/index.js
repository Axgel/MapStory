// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const https = require("https");
const fs = require("fs");
const session = require("express-session");
const { Server } = require("socket.io");


const dotenv = require("dotenv");
dotenv.config();
const db = require("./db/index");

// CREATE OUR SERVER
const PORT = 4000;
const app = express();
const cors_url = (process.env.ENVIRONMENT === "DEVELOPMENT") ? process.env.DEV_CORS : process.env.PROD_CORS;
let server;

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: cors_url,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

const sameSite = (process.env.ENVIRONMENT === "DEVELOPMENT") ? 'strict' : 'none';

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{ 
    maxAge: 12 * 60 * 60 * 1000,
    sameSite: sameSite,
    secure: 'auto'
  }
}));

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require("./routes/auth-router");
app.use("/auth", authRouter);
const storeRouter = require("./routes/store-router");
app.use("/store", storeRouter);
const fileRouter = require("./routes/file-router");
app.use("/file", fileRouter);

// INITIALIZE OUR DATABASE OBJECT
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const mapProjects = {};

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
        const { mapId, subregionId, op} = packet;
        const done = await updateSubregions(subregionId, op);
        if(done) {
          const clients = mapProjects[mapId].clients;
          const source = socket.id;
          for(const client of clients) {
            if(client === source) {
              socketIO.to(client).emit('owner-ack', {subregionId: subregionId, op: op});
            } else {
              socketIO.to(client).emit('others-ack', {subregionId: subregionId, op: op});
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


function close_all_connections(){
  db.close();
  server.close();
}

module.exports = {app, close_all_connections};
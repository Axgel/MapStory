// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const https = require("https");
const fs = require("fs");
const session = require("express-session");
const WebSocket = require('ws');
const ReconnectingWebSocket = require('reconnecting-websocket');
const sharedb = require('sharedb/lib/client')

const dotenv = require("dotenv");
dotenv.config();
const db = require("./db/index");
const sdb = require("./db/sharedb");

// CREATE OUR SERVER
const PORT = 4000;
const app = express();
const cors_url = (process.env.ENVIRONMENT == "DEVELOPMENT") ? process.env.DEV_CORS : process.env.PROD_CORS;
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

const options = {
   WebSocket: WebSocket,
   connectionTimeout: 1000,
   maxRetries: 10,
};

let socket = new ReconnectingWebSocket('ws://localhost:5050', [], options);
let connection = new sharedb.Connection(socket);
doc = connection.get('documents', "testdocument");
doc.subscribe((error) => {
  if (error) throw error;
  // If doc.type is undefined, the document has not been created, so let's create it
  if (!doc.type) {
     doc.create([], (error) => {
        if (error) console.error(error);
     });
  };
});

const sameSite = (process.env.ENVIRONMENT == "DEVELOPMENT") ? 'strict' : 'none';

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

function close_all_connections(){
  db.close();
  server.close();
}

module.exports = {app, close_all_connections};
// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const https = require("https");
const fs = require("fs");

const dotenv = require("dotenv");
dotenv.config();
const db = require("./db");

// CREATE OUR SERVER
const PORT = 4000;
const app = express();
const cors_url = (process.env.ENVIRONMENT == "DEVELOPMENT") ? process.env.DEV_CORS : process.env.PROD_CORS;
let server;

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: cors_url,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require("./routes/auth-router");
app.use("/auth", authRouter);
const demoRouter = require("./routes/demo-router");
app.use("/store", demoRouter);

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
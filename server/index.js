// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const db = require("./db");
const http = require("http");
const https = require("https");
const fs = require("fs");
const config = require("../config.json");

// CREATE OUR SERVER
const PORT = 4000;
const app = express();

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config[config.ENVIRONMENT].cors,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require("./routes/auth-router");
app.use("/auth", authRouter);
const demoRouter = require("./routes/demo-router");
app.use("/api", demoRouter);

// INITIALIZE OUR DATABASE OBJECT
db.on("error", console.error.bind(console, "MongoDB connection error:"));


switch (config.ENVIRONMENT) {
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
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    break;
}

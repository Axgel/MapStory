// THESE ARE NODE APIs WE WISH TO USE
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require('http');
const https = require('https');
const fs = require('fs');

// CREATE OUR SERVER
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(    
  cors({
    origin: process.env.CLIENT_URL_PROD,
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
const db = require("./db");
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('/home/ubuntu/Keys/privkey.pem'),
    cert: fs.readFileSync('/home/ubuntu/Keys/fullchain.pem'),
}, app)

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
})

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
})
// PUT THE SERVER IN LISTENING MODE
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

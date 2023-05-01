const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const dotenv = require("dotenv");
dotenv.config();


const app = express();
const cors_url = (process.env.ENVIRONMENT == "DEVELOPMENT") ? process.env.DEV_CORS : process.env.PROD_CORS;
const db = require("./db/index");

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
const utilRouter = require("./routes/util-router");
app.use("/util", utilRouter);

db.on("error", console.error.bind(console, "MongoDB connection error:"));


module.exports = app;
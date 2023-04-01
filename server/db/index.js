const mongoose = require("mongoose");
const config = require("../../config.json");

mongoose
  .connect(config.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "MapStory",
  })
  .catch((e) => {
    console.error("Connection error", e.message);
  });

const db = mongoose.connection;

module.exports = db;

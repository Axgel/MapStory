const express = require("express");
const router = express.Router();
const FileController = require("../controllers/file-controller");

router.get("/file", FileController.getTest);

module.exports = router;

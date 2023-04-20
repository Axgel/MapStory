const express = require("express");
const router = express.Router();
const FileController = require("../controllers/file-controller");
const auth = require('../auth');

router.get('/subregion/:mapId', FileController.getAllSubregions);
router.get('/connect/:userId/:mapId', FileController.connectNewClient);


module.exports = router;

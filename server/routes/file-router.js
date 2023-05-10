const express = require("express");
const router = express.Router();
const FileController = require("../controllers/file-controller");
const auth = require('../auth');

router.get('/subregion/:mapId', FileController.getAllSubregions);
router.get('/getProperties/:subregionId', FileController.getAllProperties);
router.put('/createProperties/:subregionId', FileController.createProperty);
router.delete('/deleteProperties/:subregionId', FileController.deleteProperty);

module.exports = router;

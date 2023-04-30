const express = require("express");
const router = express.Router();
const FileController = require("../controllers/file-controller");
const auth = require('../auth');

router.get('/subregion/:mapId', FileController.getAllSubregions);
router.put('/savesubregion', FileController.saveSubregions)

module.exports = router;

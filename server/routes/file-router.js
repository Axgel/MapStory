const express = require("express");
const router = express.Router();
const FileController = require("../controllers/file-controller");
const auth = require('../auth');

router.post('/subregion', auth.verify, FileController.createSubregion);



module.exports = router;

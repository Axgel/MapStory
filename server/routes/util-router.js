const express = require("express");
const UtilController = require("../controllers/util-controller");
const router = express.Router();

router.post("/exportSHPDBF", UtilController.exportSHPDBF);

module.exports = router;
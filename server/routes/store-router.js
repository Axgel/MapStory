const express = require("express");
const StoreController = require("../controllers/store-controller");
const router = express.Router();
const auth = require("../auth");

router.post('/subregion', auth.verify, StoreController.createSubregion);
router.post('/map', auth.verify, StoreController.createMap);

module.exports = router;

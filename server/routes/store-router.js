const express = require("express");
const StoreController = require("../controllers/store-controller");
const router = express.Router();
const auth = require("../auth");

// test
router.post('/subregion', auth.verify, StoreController.createSubregion);
router.post('/map', auth.verify, StoreController.createMap);
router.get('/ownermaps/:userId', StoreController.getPersonalAndSharedMaps);
router.put('/title/:mapId', StoreController.updateMapTitle);
router.put('/addTags/:mapId', StoreController.addTags);
 
module.exports = router;

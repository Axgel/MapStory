const express = require("express");
const StoreController = require("../controllers/store-controller");
const router = express.Router();
const auth = require("../auth");

// test
router.post('/subregion', auth.verify, StoreController.createSubregion);
router.post('/map', auth.verify, StoreController.createMap);
router.get('/ownermaps/:userId', StoreController.getPersonalAndSharedMaps);
router.get('/publishedmaps', StoreController.getPublishedMaps)
router.put('/title/:mapId', StoreController.updateMapTitle);
router.put('/publish/:mapId', StoreController.publishMap);

 
module.exports = router;

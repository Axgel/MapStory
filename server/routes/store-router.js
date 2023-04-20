const express = require("express");
const StoreController = require("../controllers/store-controller");
const router = express.Router();
const auth = require("../auth");

// test
router.post('/subregion', auth.verify, StoreController.createSubregion);
router.post('/map', auth.verify, StoreController.createMap);
router.post('/fork/:mapId', StoreController.forkMap);
router.get('/ownermaps/:userId', StoreController.getPersonalAndSharedMaps);
router.delete('/delete/:mapId', StoreController.deleteMap);
router.get('/publishedmaps', StoreController.getPublishedMaps);
router.put('/title/:mapId', StoreController.updateMapTitle);
router.put('/addTags/:mapId', StoreController.addTags);
router.put('/deleteTags/:mapId', StoreController.deleteTags);
router.put('/publish/:mapId', StoreController.publishMap);
router.delete('/map/:mapId', StoreController.deleteMap);
router.get('/map/:mapId', StoreController.getMapById);
 
module.exports = router;

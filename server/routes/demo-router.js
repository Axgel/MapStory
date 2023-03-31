/*
    This is where we'll route all of the received http requests
    into controller response functions.
    
    @author McKilla Gorilla
*/
const express = require("express");
const DemoController = require("../controllers/demo-controller");
const router = express.Router();
const auth = require("../auth");

router.get("/demo", DemoController.getDemo);
router.post("/demo", DemoController.writeDemo);

module.exports = router;

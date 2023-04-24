const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth-controller");

router.post("/register", AuthController.registerUser);
router.post("/login", AuthController.loginUser);
router.get("/logout", AuthController.logoutUser);
router.get("/loggedIn", AuthController.getLoggedIn);
// Should be route for Recover password
router.post("/recoveryEmail", AuthController.recoveryEmail);
router.post("/recoverPassword", AuthController.recoverPassword);
// Route for changing profile information
router.post("/profile/username", AuthController.changeUsername);
router.post("/profile/password", AuthController.changePassword);
router.post("/deleteUser", AuthController.deleteUser);

module.exports = router;

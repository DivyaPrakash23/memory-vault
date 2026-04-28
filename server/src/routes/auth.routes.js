const router = require("express").Router();
const { register, login, getMe, refresh, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login",    login);
router.get("/me",        protect, getMe);
router.post("/refresh",  refresh);
router.post("/logout",   protect, logout);

module.exports = router;


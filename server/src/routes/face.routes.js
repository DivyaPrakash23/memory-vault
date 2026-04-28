const router = require("express").Router();
const { registerFace, getFaces, deleteFace } = require("../controllers/face.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/register",    registerFace);
router.get("/:userId",      getFaces);
router.delete("/:id",       deleteFace);

module.exports = router;
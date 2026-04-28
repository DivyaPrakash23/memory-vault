const router = require("express").Router();
const { getAlerts, resolveAlert } = require("../controllers/alert.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.get("/:userId",       getAlerts);
router.post("/resolve/:id",  resolveAlert);

module.exports = router;
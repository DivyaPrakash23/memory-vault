const router = require("express").Router();
const { createLog, getLogs, getYesterdayLogs } = require("../controllers/activityLog.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/",                    createLog);
router.get("/:userId",              getLogs);
router.get("/:userId/yesterday",    getYesterdayLogs);

module.exports = router;
const router = require("express").Router();
const { submitTest, getTestTrends } = require("../controllers/test.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/submit",              submitTest);
router.get("/:userId/trends",       getTestTrends);

module.exports = router;
const router = require("express").Router();
const { getUser, updateUser, updatePreferences, savePushSubscription } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.get("/:id",                  getUser);
router.put("/:id",                  updateUser);
router.get("/:id/preferences",      getUser);
router.put("/:id/preferences",      updatePreferences);
router.post("/:id/push-subscribe",  savePushSubscription);

module.exports = router;
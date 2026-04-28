const router = require("express").Router();
const {
  createFamilyMember, getFamilyMembers,
  updateFamilyMember, deleteFamilyMember, logVisit,
} = require("../controllers/family.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/",               createFamilyMember);
router.get("/:userId",         getFamilyMembers);
router.put("/:id",             updateFamilyMember);
router.delete("/:id",          deleteFamilyMember);
router.post("/:id/visit",      logVisit);

module.exports = router;
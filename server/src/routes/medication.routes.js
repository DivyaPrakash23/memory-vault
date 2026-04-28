const router = require("express").Router();
const {
  createMedication, getMedications, updateMedication,
  deleteMedication, confirmMedication, getMedicationLogs,
} = require("../controllers/medication.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/",                              createMedication);
router.get("/:userId",                        getMedications);
router.get("/:userId/logs",                   getMedicationLogs);
router.put("/:medicationId",                  updateMedication);
router.delete("/:medicationId",               deleteMedication);
router.post("/:medicationId/confirm",         confirmMedication);

module.exports = router;
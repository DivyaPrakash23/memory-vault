const router = require("express").Router();
const {
  createAppointment, getAppointments, getTodayAppointments,
  updateAppointment, deleteAppointment,
} = require("../controllers/appointment.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/",                   createAppointment);
router.get("/:userId",             getAppointments);
router.get("/:userId/today",       getTodayAppointments);
router.put("/:id",                 updateAppointment);
router.delete("/:id",              deleteAppointment);

module.exports = router;
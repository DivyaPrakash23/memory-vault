const router  = require("express").Router();
const { uploadJournal, getJournals, deleteJournal } = require("../controllers/journal.controller");
const { protect } = require("../middleware/auth.middleware");
const upload  = require("../middleware/upload.middleware");

router.use(protect);
router.post("/upload",    upload.single("photo"), uploadJournal);
router.get("/:userId",    getJournals);
router.delete("/:id",     deleteJournal);

module.exports = router;
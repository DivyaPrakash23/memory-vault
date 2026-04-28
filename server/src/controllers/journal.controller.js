const MemoryJournal = require("../models/MemoryJournal");
const cloudinary    = require("../config/cloudinary");
const asyncHandler  = require("../utils/asyncHandler");
const { generateMemoryCaption } = require("../services/gemini.service");

exports.uploadJournal = asyncHandler(async (req, res) => {
  const { userId, title, tags, memoryDate } = req.body;
  let photoUrl = null;

  if (req.file) {
    // Convert buffer to base64 data URI and upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "memoryvault/journals",
    });
    photoUrl = result.secure_url;
  }

  const caption = await generateMemoryCaption(title);

  const journal = await MemoryJournal.create({
    userId,
    title,
    photoUrl,
    caption,
    tags:       tags ? JSON.parse(tags) : [],
    memoryDate: memoryDate ? new Date(memoryDate) : new Date(),
    createdBy:  req.user._id,
  });

  res.status(201).json({ success: true, journal });
});

exports.getJournals = asyncHandler(async (req, res) => {
  const journals = await MemoryJournal.find({ userId: req.params.userId }).sort("-memoryDate");
  res.json({ success: true, journals });
});

exports.deleteJournal = asyncHandler(async (req, res) => {
  const journal = await MemoryJournal.findByIdAndDelete(req.params.id);
  if (!journal) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, message: "Journal deleted" });
});
const express = require("express");
const { Op } = require("sequelize");
const WalkInToken = require("../models/walkintoken");
const Queue = require("../models/queue");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// GENERATE a walk-in token
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) return res.status(400).json({ message: "department is required" });

    // token number resets logically per department per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const countToday = await WalkInToken.count({
      where: { department, issuedAt: { [Op.gte]: startOfDay } },
    });

    const token = await WalkInToken.create({
      patientId: req.user.id,
      tokenNumber: countToday + 1,
      department,
      status: "waiting",
    });

    const queueEntry = await Queue.create({
      patientId: req.user.id,
      sourceType: "walk-in",
      sourceId: token.id,
      department,
      priorityScore: 50, // base priority for walk-ins
      status: "waiting",
    });

    const io = req.app.get("io");
    io.emit("queueUpdated", { department });

    res.status(201).json({ message: "Token generated", token, queueEntry });
  } catch (err) {
    res.status(500).json({ message: "Token generation failed", error: err.message });
  }
});

// GET my tokens
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const tokens = await WalkInToken.findAll({ where: { patientId: req.user.id } });
    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tokens", error: err.message });
  }
});

module.exports = router;


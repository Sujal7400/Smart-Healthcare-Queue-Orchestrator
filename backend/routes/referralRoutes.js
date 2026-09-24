const express = require("express");
const Referral = require("../models/referral");
const Queue = require("../models/queue");
const { authMiddleware, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// priority mapping for referral urgency levels
const URGENCY_PRIORITY = { emergency: 100, high: 80, medium: 60, low: 45 };

// CREATE a referral (staff/doctor creates this on behalf of a patient)
router.post("/create", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const { patientId, referredFrom, referredToDepartment, urgencyLevel, reason } = req.body;
    if (!patientId || !referredFrom || !referredToDepartment) {
      return res.status(400).json({ message: "patientId, referredFrom, and referredToDepartment are required" });
    }

    const referral = await Referral.create({
      patientId,
      referredFrom,
      referredToDepartment,
      urgencyLevel: urgencyLevel || "medium",
      reason: reason || null,
      status: "pending",
    });

    // Automatically place referral into the live queue with correct priority
    const queueEntry = await Queue.create({
      patientId,
      sourceType: "referral",
      sourceId: referral.id,
      department: referredToDepartment,
      priorityScore: URGENCY_PRIORITY[referral.urgencyLevel] || 60,
      status: "waiting",
    });

    referral.status = "in-queue";
    await referral.save();

    const io = req.app.get("io");
    io.emit("queueUpdated", { department: referredToDepartment });

    res.status(201).json({ message: "Referral created and added to queue", referral, queueEntry });
  } catch (err) {
    console.error("REFERRAL ERROR:", err.message);
    res.status(500).json({ message: "Referral creation failed", error: err.message });
  }
});

// GET all referrals (staff/doctor view)
router.get("/all", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const referrals = await Referral.findAll({ order: [["createdAt", "DESC"]] });
    res.json(referrals);
  } catch (err) {
    console.error("REFERRAL FETCH ERROR:", err.message);
    res.status(500).json({ message: "Failed to fetch referrals", error: err.message });
  }
});

module.exports = router;
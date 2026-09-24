const express = require("express");
const Appointment = require("../models/appointment");
const Queue = require("../models/queue");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// BOOK an appointment
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const { doctorName, department, date, timeSlot } = req.body;
    if (!doctorName || !department || !date || !timeSlot) {
      return res.status(400).json({ message: "doctorName, department, date, and timeSlot are required" });
    }

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorName,
      department,
      date,
      timeSlot,
      status: "booked",
    });

    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
});

// GET my appointments
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({ where: { patientId: req.user.id } });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch appointments", error: err.message });
  }
});

// CHECK-IN — patient arrives at hospital for their appointment, enters live queue
router.post("/checkin/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "This is not your appointment" });
    }

    appointment.status = "checked-in";
    await appointment.save();

    const queueEntry = await Queue.create({
      patientId: appointment.patientId,
      sourceType: "appointment",
      sourceId: appointment.id,
      department: appointment.department,
      priorityScore: 40, // base priority for scheduled appointments
      status: "waiting",
    });

    const io = req.app.get("io");
    io.emit("queueUpdated", { department: appointment.department });

    res.json({ message: "Checked in successfully, added to live queue", queueEntry });
  } catch (err) {
    res.status(500).json({ message: "Check-in failed", error: err.message });
  }
});

// CANCEL appointment
router.put("/cancel/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    if (appointment.patientId !== req.user.id) {
      return res.status(403).json({ message: "This is not your appointment" });
    }
    appointment.status = "cancelled";
    await appointment.save();
    res.json({ message: "Appointment cancelled", appointment });
  } catch (err) {
    res.status(500).json({ message: "Cancellation failed", error: err.message });
  }
});

module.exports = router;


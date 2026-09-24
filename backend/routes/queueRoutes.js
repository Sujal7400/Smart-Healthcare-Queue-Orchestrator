const express = require("express");
const { Op } = require("sequelize");
const Queue = require("../models/queue");
const Patient = require("../models/patient");
const { authMiddleware, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

// ---------- FORECASTING HELPER ----------
// Simple average-based forecasting:
// Looks at the last N patients marked "done" in this department,
// calculates their average time spent in queue (enteredAt -> updatedAt),
// and uses that average to estimate wait time for people ahead in line.
const AVERAGE_SAMPLE_SIZE = 10;
const DEFAULT_AVG_MINUTES = 10; // fallback if no historical data exists yet

async function getAverageServiceMinutes(department) {
  const recentDone = await Queue.findAll({
    where: { department, status: "done" },
    order: [["updatedAt", "DESC"]],
    limit: AVERAGE_SAMPLE_SIZE,
  });

  if (recentDone.length === 0) return DEFAULT_AVG_MINUTES;

  const totalMinutes = recentDone.reduce((sum, entry) => {
    const minutes = (new Date(entry.updatedAt) - new Date(entry.enteredAt)) / 60000;
    return sum + Math.max(minutes, 1); // avoid negative/zero values
  }, 0);

  return totalMinutes / recentDone.length;
}

// Recalculates position-based estimated wait time for all "waiting" entries
// in a department, ordered by priority. Call this after any queue change.
async function recalculateWaitTimes(department) {
  const avgMinutes = await getAverageServiceMinutes(department);

  const waitingEntries = await Queue.findAll({
    where: { department, status: "waiting" },
    order: [
      ["priorityScore", "DESC"],
      ["enteredAt", "ASC"],
    ],
  });

  for (let i = 0; i < waitingEntries.length; i++) {
    const estimated = Math.round(avgMinutes * i); // people ahead * avg time
    waitingEntries[i].estimatedWaitMinutes = estimated;
    await waitingEntries[i].save();
  }

  return waitingEntries;
}

// ---------- ROUTES ----------

// GET live queue for a department (sorted by priority) - patients & staff both can view
router.get("/live/:department", authMiddleware, async (req, res) => {
  try {
    const { department } = req.params;
    const queue = await recalculateWaitTimes(department);

    const queueWithPatientInfo = await Promise.all(
      queue.map(async (entry, index) => {
        const patient = await Patient.findByPk(entry.patientId, {
          attributes: ["id", "name"],
        });
        return {
          position: index + 1,
          id: entry.id,
          patient,
          sourceType: entry.sourceType,
          priorityScore: entry.priorityScore,
          estimatedWaitMinutes: entry.estimatedWaitMinutes,
          enteredAt: entry.enteredAt,
        };
      })
    );

    res.json({ department, totalWaiting: queueWithPatientInfo.length, queue: queueWithPatientInfo });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch live queue", error: err.message });
  }
});
// GET my position in queue (patient checking their own status)
router.get("/my-status", authMiddleware, async (req, res) => {
  try {
    let myEntry = await Queue.findOne({
      where: { patientId: req.user.id, status: "waiting" },
      order: [["enteredAt", "DESC"]],
    });

    if (!myEntry) {
      return res.json({ message: "You are not currently in any queue" });
    }

    // Recalculate wait times for this department before responding,
    // so the estimate is always fresh (not just when staff loads the live view)
    await recalculateWaitTimes(myEntry.department);
    myEntry = await Queue.findByPk(myEntry.id); // re-fetch updated value

    const aheadCount = await Queue.count({
      where: {
        department: myEntry.department,
        status: "waiting",
        [Op.or]: [
          { priorityScore: { [Op.gt]: myEntry.priorityScore } },
          {
            priorityScore: myEntry.priorityScore,
            enteredAt: { [Op.lt]: myEntry.enteredAt },
          },
        ],
      },
    });

    res.json({
      department: myEntry.department,
      position: aheadCount + 1,
      estimatedWaitMinutes: myEntry.estimatedWaitMinutes,
      status: myEntry.status,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch status", error: err.message });
  }
});

// STAFF: call the next patient (moves top of queue to in-consultation)
router.put("/call-next/:department", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const { department } = req.params;
    const next = await Queue.findOne({
      where: { department, status: "waiting" },
      order: [
        ["priorityScore", "DESC"],
        ["enteredAt", "ASC"],
      ],
    });

    if (!next) return res.status(404).json({ message: "No patients waiting in this department" });

    next.status = "in-consultation";
    await next.save();

    const io = req.app.get("io");
    io.emit("queueUpdated", { department });

    res.json({ message: "Next patient called", entry: next });
  } catch (err) {
    res.status(500).json({ message: "Failed to call next patient", error: err.message });
  }
});

// STAFF: mark a queue entry as done (frees them from queue, feeds forecasting data)
router.put("/complete/:id", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const entry = await Queue.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Queue entry not found" });

    entry.status = "done";
    await entry.save();

    await recalculateWaitTimes(entry.department);

    const io = req.app.get("io");
    io.emit("queueUpdated", { department: entry.department });

    res.json({ message: "Marked as completed", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete entry", error: err.message });
  }
});

// STAFF: remove/skip a queue entry (e.g. patient left, no-show)
router.put("/remove/:id", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const entry = await Queue.findByPk(req.params.id);
    if (!entry) return res.status(404).json({ message: "Queue entry not found" });

    entry.status = "removed";
    await entry.save();

    await recalculateWaitTimes(entry.department);

    const io = req.app.get("io");
    io.emit("queueUpdated", { department: entry.department });

    res.json({ message: "Entry removed from queue", entry });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove entry", error: err.message });
  }
});

// STAFF: dashboard summary stats
router.get("/stats/:department", authMiddleware, restrictTo("staff", "doctor", "admin"), async (req, res) => {
  try {
    const { department } = req.params;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const totalToday = await Queue.count({
      where: { department, createdAt: { [Op.gte]: startOfDay } },
    });

    const currentlyWaiting = await Queue.count({
      where: { department, status: "waiting" },
    });

    const completedToday = await Queue.count({
      where: { department, status: "done", updatedAt: { [Op.gte]: startOfDay } },
    });

    const avgMinutes = await getAverageServiceMinutes(department);

    res.json({
      totalToday,
      currentlyWaiting,
      completedToday,
      averageWaitMinutes: Math.round(avgMinutes),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

module.exports = router;

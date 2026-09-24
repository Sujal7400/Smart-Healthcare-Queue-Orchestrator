const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const { sequelize, connectDB } = require("./config/db");

// Import all models so Sequelize knows about them before sync
require("./models/patient");
require("./models/appointment");
require("./models/walkintoken");
require("./models/referral");
require("./models/queue");

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoute");
const tokenRoutes = require("./routes/tokenRoute");
const queueRoutes = require("./routes/queueRoutes");
const referralRoutes = require("./routes/referralRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Make io accessible inside route controllers via req.app.get("io")
app.set("io", io);

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/tokens", tokenRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/referrals", referralRoutes);

app.get("/", (req, res) => {
  res.send("Smart Healthcare Queue Orchestrator API is running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await sequelize.sync(); // creates tables automatically if they don't exist
  console.log("All models synced with MySQL");
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

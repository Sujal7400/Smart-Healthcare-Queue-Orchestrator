const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require("./patient");

const Queue = sequelize.define("Queue", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Patient, key: "id" },
  },
  sourceType: {
    type: DataTypes.ENUM("appointment", "walk-in", "referral"),
    allowNull: false,
  },
  sourceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  priorityScore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  estimatedWaitMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.ENUM("waiting", "in-consultation", "done", "removed"),
    allowNull: false,
    defaultValue: "waiting",
  },
  enteredAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: "queue",
  timestamps: true,
});

Queue.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(Queue, { foreignKey: "patientId" });

module.exports = Queue;
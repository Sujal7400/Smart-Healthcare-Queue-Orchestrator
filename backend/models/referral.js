const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require("./patient");

const Referral = sequelize.define("Referral", {
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
  referredFrom: {
    type: DataTypes.STRING, // e.g. referring clinic/doctor name
    allowNull: false,
  },
  referredToDepartment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  urgencyLevel: {
    type: DataTypes.ENUM("low", "medium", "high", "emergency"),
    allowNull: false,
    defaultValue: "medium",
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "in-queue", "completed", "cancelled"),
    allowNull: false,
    defaultValue: "pending",
  },
}, {
  tableName: "referrals",
  timestamps: true,
});

Referral.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(Referral, { foreignKey: "patientId" });

module.exports = Referral;

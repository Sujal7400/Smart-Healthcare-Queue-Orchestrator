const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require("./patient");

const Appointment = sequelize.define("Appointment", {
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
  doctorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  timeSlot: {
    type: DataTypes.STRING, // e.g. "10:00-10:15"
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("booked", "checked-in", "completed", "cancelled", "no-show"),
    allowNull: false,
    defaultValue: "booked",
  },
}, {
  tableName: "appointments",
  timestamps: true,
});

Appointment.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(Appointment, { foreignKey: "patientId" });

module.exports = Appointment;

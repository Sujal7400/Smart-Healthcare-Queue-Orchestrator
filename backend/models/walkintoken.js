const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Patient = require("./patient");

const WalkInToken = sequelize.define("WalkInToken", {
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
  tokenNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  issuedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM("waiting", "called", "served", "skipped"),
    allowNull: false,
    defaultValue: "waiting",
  },
}, {
  tableName: "walkin_tokens",
  timestamps: true,
});

WalkInToken.belongsTo(Patient, { foreignKey: "patientId" });
Patient.hasMany(WalkInToken, { foreignKey: "patientId" });

module.exports = WalkInToken;


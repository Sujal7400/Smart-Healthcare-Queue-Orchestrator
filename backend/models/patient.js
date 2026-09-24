const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Patient = sequelize.define("Patient", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false, // bcrypt hash stored, never plain text
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM("patient", "staff", "doctor", "admin"),
    allowNull: false,
    defaultValue: "patient",
  },
}, {
  tableName: "patients",
  timestamps: true,
});

module.exports = Patient;


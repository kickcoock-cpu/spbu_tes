const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FuelType = sequelize.define('FuelType', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  }
}, {
  tableName: 'fuel_types',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = FuelType;
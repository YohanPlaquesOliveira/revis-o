const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Device extends Model {}

Device.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id'
    }
  },
  serial_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  firmware_version: {
    type: DataTypes.STRING(20)
  },
  last_connection: {
    type: DataTypes.DATE
  },
  last_transaction: {
    type: DataTypes.DATE
  },
  settings: {
    type: DataTypes.JSONB
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'blocked'),
    defaultValue: 'inactive',
    allowNull: false
  },
  created_by: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'YohanPlaques'
  },
  updated_by: {
    type: DataTypes.STRING(50)
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: '2025-02-08 03:55:24'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: '2025-02-08 03:55:24'
  }
}, {
  sequelize,
  modelName: 'Device',
  tableName: 'devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Device;
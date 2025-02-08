const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Endpoints extends Model {}

Endpoints.init({
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
  notification_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  success_url: {
    type: DataTypes.STRING(255)
  },
  failure_url: {
    type: DataTypes.STRING(255)
  },
  pending_url: {
    type: DataTypes.STRING(255)
  },
  webhook_secret: {
    type: DataTypes.STRING(100)
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
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
  modelName: 'Endpoints',
  tableName: 'endpoints',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Endpoints;
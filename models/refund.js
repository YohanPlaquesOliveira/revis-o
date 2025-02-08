const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Refund extends Model {}

Refund.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  payment_id: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  mp_refund_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  account_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(200)
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  processed_at: {
    type: DataTypes.DATE
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
  modelName: 'Refund',
  tableName: 'refunds',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Refund;
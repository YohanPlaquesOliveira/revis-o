const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class MerchantOrder extends Model {}

MerchantOrder.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  mp_order_id: {
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
  external_reference: {
    type: DataTypes.STRING(50)
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'cancelled'),
    defaultValue: 'pending',
    allowNull: false
  },
  payments: {
    type: DataTypes.JSONB
  },
  items: {
    type: DataTypes.JSONB
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
  modelName: 'MerchantOrder',
  tableName: 'merchant_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MerchantOrder;
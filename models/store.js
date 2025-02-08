const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Store extends Model {}

Store.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  document: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  address: {
    type: DataTypes.STRING(200)
  },
  city: {
    type: DataTypes.STRING(100)
  },
  state: {
    type: DataTypes.STRING(2)
  },
  zip_code: {
    type: DataTypes.STRING(8)
  },
  integration_type: {
    type: DataTypes.ENUM('POS', 'PDV', 'ECOMMERCE'),
    allowNull: false,
    defaultValue: 'POS'
  },
  settings: {
    type: DataTypes.JSONB
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'blocked'),
    defaultValue: 'pending',
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
  modelName: 'Store',
  tableName: 'stores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Store;
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Account extends Model {}

Account.init({
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
  mp_access_token: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mp_public_key: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  mp_user_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  mp_store_id: {
    type: DataTypes.STRING(50)
  },
  mp_pos_id: {
    type: DataTypes.STRING(50)
  },
  mp_external_id: {
    type: DataTypes.STRING(50)
  },
  webhook_url: {
    type: DataTypes.STRING(255)
  },
  notification_url: {
    type: DataTypes.STRING(255)
  },
  callback_url: {
    type: DataTypes.STRING(255)
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
  modelName: 'Account',
  tableName: 'accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Account;
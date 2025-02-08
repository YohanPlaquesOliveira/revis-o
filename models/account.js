const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Account extends Model {}

Account.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mp_user_id: {
        type: DataTypes.STRING,
        unique: true
    },
    mp_access_token: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    sequelize,
    modelName: 'Account',
    timestamps: true
});

module.exports = Account;
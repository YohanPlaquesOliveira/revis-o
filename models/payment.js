const { Model, DataTypes } = require('sequelize');
const sequelize = require('../services/db');

class Payment extends Model {}

Payment.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mp_payment_id: {
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
    store_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    pos_id: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    payment_method: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSONB
    },
    created_by: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'YohanPlaquesOliveira'
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: '2025-02-08 18:35:54'
    },
    updated_by: {
        type: DataTypes.STRING(50)
    },
    updated_at: {
        type: DataTypes.DATE
    }
}, {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Payment;
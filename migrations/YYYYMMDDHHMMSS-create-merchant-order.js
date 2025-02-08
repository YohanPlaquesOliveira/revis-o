'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('merchant_orders', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      mp_order_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      external_reference: {
        type: Sequelize.STRING(50)
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      paid_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      payments: {
        type: Sequelize.JSONB
      },
      items: {
        type: Sequelize.JSONB
      },
      created_by: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'YohanPlaques'
      },
      updated_by: {
        type: Sequelize.STRING(50)
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '2025-02-08 03:54:08'
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: '2025-02-08 03:54:08'
      }
    });

    await queryInterface.addIndex('merchant_orders', ['mp_order_id']);
    await queryInterface.addIndex('merchant_orders', ['account_id']);
    await queryInterface.addIndex('merchant_orders', ['external_reference']);
    await queryInterface.addIndex('merchant_orders', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('merchant_orders');
  }
};
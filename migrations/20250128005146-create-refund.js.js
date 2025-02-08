'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('refunds', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      payment_id: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      mp_refund_id: {
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
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(200)
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      },
      processed_at: {
        type: Sequelize.DATE
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

    await queryInterface.addIndex('refunds', ['payment_id']);
    await queryInterface.addIndex('refunds', ['mp_refund_id']);
    await queryInterface.addIndex('refunds', ['account_id']);
    await queryInterface.addIndex('refunds', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('refunds');
  }
};
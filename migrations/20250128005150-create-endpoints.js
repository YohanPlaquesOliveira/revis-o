'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('endpoints', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      store_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      notification_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      success_url: {
        type: Sequelize.STRING(255)
      },
      failure_url: {
        type: Sequelize.STRING(255)
      },
      pending_url: {
        type: Sequelize.STRING(255)
      },
      webhook_secret: {
        type: Sequelize.STRING(100)
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
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

    await queryInterface.addIndex('endpoints', ['store_id']);
    await queryInterface.addIndex('endpoints', ['is_active']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('endpoints');
  }
};
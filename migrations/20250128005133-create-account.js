'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accounts', {
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
      mp_access_token: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      mp_public_key: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      mp_user_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      mp_store_id: {
        type: Sequelize.STRING(50)
      },
      mp_pos_id: {
        type: Sequelize.STRING(50)
      },
      mp_external_id: {
        type: Sequelize.STRING(50)
      },
      webhook_url: {
        type: Sequelize.STRING(255)
      },
      notification_url: {
        type: Sequelize.STRING(255)
      },
      callback_url: {
        type: Sequelize.STRING(255)
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'pending', 'blocked'),
        defaultValue: 'pending',
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

    await queryInterface.addIndex('accounts', ['store_id']);
    await queryInterface.addIndex('accounts', ['mp_user_id']);
    await queryInterface.addIndex('accounts', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('accounts');
  }
};
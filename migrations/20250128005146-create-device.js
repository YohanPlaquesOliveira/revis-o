'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('devices', {
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
      serial_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      model: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      firmware_version: {
        type: Sequelize.STRING(20)
      },
      last_connection: {
        type: Sequelize.DATE
      },
      last_transaction: {
        type: Sequelize.DATE
      },
      settings: {
        type: Sequelize.JSONB
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance', 'blocked'),
        defaultValue: 'inactive',
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

    await queryInterface.addIndex('devices', ['store_id']);
    await queryInterface.addIndex('devices', ['serial_number']);
    await queryInterface.addIndex('devices', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('devices');
  }
};
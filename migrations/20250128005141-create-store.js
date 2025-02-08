'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('stores', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      document: {
        type: Sequelize.STRING(14),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20)
      },
      address: {
        type: Sequelize.STRING(200)
      },
      city: {
        type: Sequelize.STRING(100)
      },
      state: {
        type: Sequelize.STRING(2)
      },
      zip_code: {
        type: Sequelize.STRING(8)
      },
      integration_type: {
        type: Sequelize.ENUM('POS', 'PDV', 'ECOMMERCE'),
        allowNull: false,
        defaultValue: 'POS'
      },
      settings: {
        type: Sequelize.JSONB
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

    await queryInterface.addIndex('stores', ['document']);
    await queryInterface.addIndex('stores', ['status']);
    await queryInterface.addIndex('stores', ['integration_type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('stores');
  }
};
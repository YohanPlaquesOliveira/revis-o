const sequelize = require('../services/db');
const Account = require('./account');
const Device = require('./device');
const Endpoints = require('./endpoints');
const MerchantOrder = require('./merchantOrder');
const Refund = require('./refund');
const Store = require('./store');
const logger = require('../middlewares/logger');

// Configurar relacionamentos com onDelete e onUpdate
const relationships = {
  initializeRelationships() {
    try {
      // Store -> Device (1:N)
      Store.hasMany(Device, { 
        foreignKey: 'store_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Device.belongsTo(Store, { 
        foreignKey: 'store_id'
      });

      // Store -> Account (1:1)
      Store.hasOne(Account, { 
        foreignKey: 'store_id',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
      Account.belongsTo(Store, { 
        foreignKey: 'store_id'
      });

      // Outros relacionamentos...

      logger.info('Database relationships initialized successfully');
    } catch (error) {
      logger.error('Error initializing database relationships:', error);
      throw error;
    }
  }
};

module.exports = {
  sequelize,
  relationships,
  models: {
    Account,
    Device,
    Endpoints,
    MerchantOrder,
    Refund,
    Store
  }
};
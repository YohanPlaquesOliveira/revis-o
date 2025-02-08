const sequelize = require('../services/db');
const Account = require('./account');
const Device = require('./device');
const Endpoints = require('./endpoints');
const MerchantOrder = require('./merchantOrder');
const Refund = require('./refund');
const Store = require('./store');

// Definir relacionamentos
Store.hasMany(Device, { foreignKey: 'store_id' });
Device.belongsTo(Store, { foreignKey: 'store_id' });

Store.hasOne(Account, { foreignKey: 'store_id' });
Account.belongsTo(Store, { foreignKey: 'store_id' });

Store.hasOne(Endpoints, { foreignKey: 'store_id' });
Endpoints.belongsTo(Store, { foreignKey: 'store_id' });

Account.hasMany(MerchantOrder, { foreignKey: 'account_id' });
MerchantOrder.belongsTo(Account, { foreignKey: 'account_id' });

Account.hasMany(Refund, { foreignKey: 'account_id' });
Refund.belongsTo(Account, { foreignKey: 'account_id' });

module.exports = {
  sequelize,
  Account,
  Device,
  Endpoints,
  MerchantOrder,
  Refund,
  Store
};
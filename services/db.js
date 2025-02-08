const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../middlewares/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env].database;

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  }
);

module.exports = sequelize;
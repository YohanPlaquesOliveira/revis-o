const { sequelize } = require('../models');
const redis = require('../services/redis');
const mqtt = require('../services/mqtt');
const logger = require('../middlewares/logger');

async function initializeServices() {
  try {
    logger.info('Starting services initialization...', {
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });

    // Conectar ao banco de dados
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    logger.info('Database models synchronized');

    // Conectar Redis
    await redis.connect();
    logger.info('Redis connection established');

    // Conectar MQTT
    await mqtt.connect();
    logger.info('MQTT connection established');

    logger.info('All services initialized successfully', {
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });

  } catch (error) {
    logger.error('Error initializing services:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });
    process.exit(1);
  }
}

module.exports = initializeServices;
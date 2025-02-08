const { sequelize } = require('../models');
const redis = require('../services/redis');
const mqtt = require('../services/mqtt');
const logger = require('../middlewares/logger');

// Configurar ambiente de teste
process.env.NODE_ENV = 'test';
process.env.CURRENT_USER = 'YohanPlaquesOliveira';
process.env.CURRENT_TIMESTAMP = '2025-02-08 17:00:29';

// Silenciar logs durante testes
logger.level = 'error';

beforeAll(async () => {
  try {
    // Conectar serviços
    await sequelize.authenticate();
    await redis.connect();
    await mqtt.connect();
    
    // Limpar e recriar banco de testes
    await sequelize.sync({ force: true });
    
    logger.info('Test environment setup completed', {
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });
  } catch (error) {
    logger.error('Error setting up test environment:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });
    throw error;
  }
});

afterAll(async () => {
  try {
    // Limpar banco
    await sequelize.drop();
    
    // Desconectar serviços
    await Promise.all([
      redis.disconnect(),
      mqtt.disconnect(),
      sequelize.close()
    ]);
    
    logger.info('Test environment cleanup completed', {
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });
  } catch (error) {
    logger.error('Error cleaning up test environment:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      user: process.env.CURRENT_USER
    });
    throw error;
  }
});

// Configurar timeouts globais
jest.setTimeout(10000);
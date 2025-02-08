const { sequelize } = require('../models');
const redis = require('../services/redis');
const mqtt = require('../services/mqtt');
const logger = require('../middlewares/logger');

beforeAll(async () => {
  try {
    // Sincronizar banco de dados
    await sequelize.sync({ force: true });
    
    // Conectar Redis
    await redis.connect();
    
    // Conectar MQTT
    await mqtt.connect();
    
    logger.info('Test environment setup completed', {
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error setting up test environment:', error);
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
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error cleaning up test environment:', error);
    throw error;
  }
});

// Configurar timeouts globais
jest.setTimeout(10000);

// Silenciar logs durante testes
logger.level = 'error';
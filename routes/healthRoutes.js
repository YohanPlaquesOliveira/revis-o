const express = require('express');
const router = express.Router();
const { redis } = require('../services/redis');
const { sequelize } = require('../models');
const mqtt = require('../services/mqtt');

router.get('/health', async (req, res) => {
  try {
    // Verifica conexão com Redis
    await redis.ping();
    
    // Verifica conexão com banco de dados
    await sequelize.authenticate();
    
    // Verifica conexão MQTT
    const mqttConnected = mqtt.connected;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'connected',
        database: 'connected',
        mqtt: mqttConnected ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
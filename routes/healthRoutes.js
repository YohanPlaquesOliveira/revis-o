const express = require('express');
const router = express.Router();
const { redis } = require('../services/redis');
const { sequelize } = require('../models');
const mqtt = require('../services/mqtt');
const os = require('os');

// Cache para evitar sobrecarga
let healthCache = {
  timestamp: 0,
  data: null
};

const CACHE_TTL = 30000; // 30 segundos

router.get('/health', async (req, res) => {
  try {
    // Verificar cache
    if (Date.now() - healthCache.timestamp < CACHE_TTL) {
      return res.json(healthCache.data);
    }

    const checks = await Promise.allSettled([
      checkRedis(),
      checkDatabase(),
      checkMQTT(),
      checkSystem()
    ]);

    const healthStatus = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        redis: checks[0].status === 'fulfilled' ? checks[0].value : { status: 'error', error: checks[0].reason },
        database: checks[1].status === 'fulfilled' ? checks[1].value : { status: 'error', error: checks[1].reason },
        mqtt: checks[2].status === 'fulfilled' ? checks[2].value : { status: 'error', error: checks[2].reason }
      },
      system: checks[3].value
    };

    // Determinar status geral
    if (checks.some(check => check.status === 'rejected')) {
      healthStatus.status = 'degraded';
    }

    // Atualizar cache
    healthCache = {
      timestamp: Date.now(),
      data: healthStatus
    };

    res.json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function checkRedis() {
  const start = Date.now();
  await redis.ping();
  return {
    status: 'connected',
    latency: Date.now() - start
  };
}

async function checkDatabase() {
  const start = Date.now();
  await sequelize.authenticate();
  return {
    status: 'connected',
    latency: Date.now() - start
  };
}

async function checkMQTT() {
  return {
    status: mqtt.connected ? 'connected' : 'disconnected',
    lastPing: mqtt.lastPing
  };
}

function checkSystem() {
  return {
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    },
    uptime: os.uptime(),
    load: os.loadavg()
  };
}

module.exports = router;
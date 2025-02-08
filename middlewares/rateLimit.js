const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../services/redis');
const logger = require('./logger');

const createLimiter = (options = {}) => {
  return rateLimit({
    store: new RedisStore({
      client: redis.client,
      prefix: 'rate-limit:'
    }),
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutos
    max: options.max || 100,
    message: {
      error: 'Too many requests, please try again later.',
      retryAfter: options.windowMs / 1000
    },
    handler: (req, res) => {
      logger.warn('Rate limit exceeded:', {
        ip: req.ip,
        path: req.path,
        timestamp: '2025-02-08 03:52:41',
        user: 'YohanPlaques'
      });
      
      res.status(429).json({
        error: 'Too many requests',
        retryAfter: options.windowMs / 1000
      });
    }
  });
};

// Limitadores específicos
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100
});

const authLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5
});

const webhookLimiter = createLimiter({
  windowMs: 1 * 60 * 1000,
  max: 60
});

module.exports = {
  apiLimiter,
  authLimiter,
  webhookLimiter
};
const Redis = require('ioredis');
const config = require('../config/redis');
const logger = require('../middlewares/logger');

class RedisService {
  constructor() {
    this.client = new Redis(config.url);

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });
  }

  async set(key, value, ttl = null) {
    try {
      if (ttl) {
        await this.client.set(key, JSON.stringify(value), 'EX', ttl);
      } else {
        await this.client.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      throw error;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      throw error;
    }
  }
}

module.exports = new RedisService();
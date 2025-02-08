const logger = require('../middlewares/logger');

class RedisUtil {
  static formatKey(prefix, id) {
    return `${prefix}:${id}`;
  }

  static async withLock(redis, key, callback, timeout = 10000) {
    const lockKey = `lock:${key}`;
    const token = Date.now().toString();

    try {
      const acquired = await redis.set(lockKey, token, 'NX', 'PX', timeout);
      if (!acquired) {
        throw new Error('Failed to acquire lock');
      }

      const result = await callback();

      await redis.del(lockKey);
      return result;
    } catch (error) {
      logger.error('Redis lock error:', error);
      throw error;
    }
  }

  static parseResponse(response) {
    try {
      return typeof response === 'string' 
        ? JSON.parse(response)
        : response;
    } catch (error) {
      logger.error('Error parsing Redis response:', error);
      return null;
    }
  }
}

module.exports = RedisUtil;
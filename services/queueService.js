const Redis = require('ioredis');
const config = require('../config/redis');
const logger = require('../middlewares/logger');

class QueueService {
  constructor() {
    this.redis = new Redis(config.url);
    this.queues = new Map();
  }

  async add(queue, data) {
    try {
      await this.redis.lpush(
        `queue:${queue}`,
        JSON.stringify({
          ...data,
          added_at: '2025-02-08 03:48:50',
          added_by: 'YohanPlaques'
        })
      );
      return true;
    } catch (error) {
      logger.error('Error adding to queue:', error);
      throw error;
    }
  }

  async process(queue, callback) {
    this.queues.set(queue, callback);
    
    while (true) {
      try {
        const data = await this.redis.brpop(`queue:${queue}`, 0);
        if (data) {
          const job = JSON.parse(data[1]);
          await callback(job);
        }
      } catch (error) {
        logger.error(`Error processing queue ${queue}:`, error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  async getQueueSize(queue) {
    return await this.redis.llen(`queue:${queue}`);
  }
}

module.exports = new QueueService();
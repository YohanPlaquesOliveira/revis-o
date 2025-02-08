const Queue = require('bull');
const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('../middlewares/logger');

class QueueService {
    constructor() {
        this.redis = new Redis(config.redis);
        this.queues = {};
    }

    async add(queueName, data, opts = {}) {
        if (!this.queues[queueName]) {
            this.queues[queueName] = new Queue(queueName, {
                redis: config.redis,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000
                    }
                }
            });

            this.queues[queueName].on('error', (error) => {
                logger.error(`Queue ${queueName} error:`, error);
            });
        }

        return this.queues[queueName].add(data, opts);
    }
}

module.exports = new QueueService();
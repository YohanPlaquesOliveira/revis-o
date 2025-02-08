const config = require('./config');
const env = process.env.NODE_ENV || 'development';

module.exports = {
  url: config[env].redis.url,
  prefix: config[env].redis.prefix,
  options: {
    retryStrategy: (times) => {
      return Math.min(times * 50, 2000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    autoResubscribe: true,
    autoResendUnfulfilledCommands: true,
    lazyConnect: true,
    keyPrefix: config[env].redis.prefix,
    showFriendlyErrorStack: env !== 'production'
  },
  keys: {
    device: 'device:{id}',
    token: 'token:{id}',
    payment: 'payment:{id}',
    lock: 'lock:{key}',
    queue: 'queue:{name}'
  },
  ttl: {
    device: 86400, // 24h
    token: 3600, // 1h
    payment: 7200, // 2h
    lock: 30 // 30s
  }
};
const config = require('./config');
const env = process.env.NODE_ENV || 'development';

module.exports = {
  broker: config[env].mqtt.broker,
  username: config[env].mqtt.username,
  password: config[env].mqtt.password,
  options: {
    keepalive: 60,
    clientId: `mp_pos_${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    qos: 1,
    retain: false
  },
  topics: {
    device: 'pos/device/:id',
    status: 'pos/device/:id/status',
    payment: 'pos/device/:id/payment',
    command: 'pos/device/:id/command'
  },
  qos: {
    command: 1,
    status: 1,
    payment: 2
  }
};
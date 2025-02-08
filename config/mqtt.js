const config = require('./config');
const env = process.env.NODE_ENV || 'development';
const path = require('path');
const fs = require('fs');

const mqttConfig = {
  broker: config[env].mqtt.broker,
  username: config[env].mqtt.username,
  password: config[env].mqtt.password,
  options: {
    keepalive: 60,
    clientId: `mp_pos_${process.pid}_${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    qos: 1,
    retain: false,
    protocol: env === 'production' ? 'mqtts' : 'mqtt'
  },
  topics: {
    device: 'pos/device/:id',
    status: 'pos/device/:id/status',
    payment: 'pos/device/:id/payment',
    command: 'pos/device/:id/command'
  },
  qos: {
    command: 2, // Garantir entrega exata uma vez
    status: 1,  // Pelo menos uma vez
    payment: 2  // Exatamente uma vez
  }
};

// Adicionar SSL/TLS em produção
if (env === 'production') {
  mqttConfig.options.ssl = true;
  mqttConfig.options.ca = [fs.readFileSync(path.join(__dirname, '../certs/ca.pem'))];
  mqttConfig.options.cert = fs.readFileSync(path.join(__dirname, '../certs/cert.pem'));
  mqttConfig.options.key = fs.readFileSync(path.join(__dirname, '../certs/key.pem'));
  mqttConfig.options.rejectUnauthorized = true;
}

// Validação de tópicos
mqttConfig.validateTopic = (topic) => {
  const validTopicRegex = /^pos\/device\/[a-zA-Z0-9-_]+\/(status|payment|command)$/;
  return validTopicRegex.test(topic);
};

module.exports = mqttConfig;
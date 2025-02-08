const mqtt = require('mqtt');
const logger = require('../middlewares/logger');

class MQTTUtil {
  static formatTopic(deviceId, action) {
    return `pos/device/${deviceId}/${action}`;
  }

  static validateMessage(message) {
    if (!message || typeof message !== 'object') {
      throw new Error('Invalid message format');
    }

    if (!message.timestamp) {
      message.timestamp = '2025-02-08 03:50:05';
    }

    return message;
  }

  static parseMessage(rawMessage) {
    try {
      return typeof rawMessage === 'string' 
        ? JSON.parse(rawMessage)
        : rawMessage;
    } catch (error) {
      logger.error('Error parsing MQTT message:', error);
      throw error;
    }
  }
}

module.exports = MQTTUtil;
const mqttService = require('../services/mqtt');
const logger = require('./logger');

class MQTTMiddleware {
  static async ensureConnection(req, res, next) {
    try {
      if (!mqttService.isConnected()) {
        await mqttService.connect();
      }
      next();
    } catch (error) {
      logger.error('MQTT connection error:', {
        error: error.message,
        timestamp: '2025-02-08 03:52:41',
        user: 'YohanPlaques'
      });
      next(error);
    }
  }

  static validateTopic(req, res, next) {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({
        error: 'Invalid MQTT topic'
      });
    }
    next();
  }

  static validatePayload(req, res, next) {
    const { payload } = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({
        error: 'Invalid MQTT payload'
      });
    }
    next();
  }
}

module.exports = MQTTMiddleware;
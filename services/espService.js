const mqtt = require('./mqtt');
const logger = require('../middlewares/logger');

class ESPService {
  constructor() {
    this.baseTopic = 'pos/device';
  }

  async sendCommand(deviceId, command, payload) {
    try {
      const topic = `${this.baseTopic}/${deviceId}/command`;
      await mqtt.publish(topic, {
        command,
        payload,
        timestamp: '2025-02-08 03:48:50'
      });
      
      logger.info(`Command sent to device ${deviceId}:`, { command, payload });
      return true;
    } catch (error) {
      logger.error(`Error sending command to device ${deviceId}:`, error);
      throw error;
    }
  }

  async getDeviceStatus(deviceId) {
    try {
      const topic = `${this.baseTopic}/${deviceId}/status`;
      await mqtt.publish(topic, { 
        type: 'STATUS_REQUEST',
        timestamp: '2025-02-08 03:48:50'
      });
      
      // Implementar lógica de espera da resposta
      return new Promise((resolve) => {
        mqtt.subscribe(`${this.baseTopic}/${deviceId}/status/response`, (message) => {
          resolve(message);
        });
      });
    } catch (error) {
      logger.error(`Error getting status for device ${deviceId}:`, error);
      throw error;
    }
  }
}

module.exports = new ESPService();
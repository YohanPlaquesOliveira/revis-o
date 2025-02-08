class ESPService {
  async getDeviceStatus(deviceId, timeout = 5000) {
    try {
      const topic = `${this.baseTopic}/${deviceId}/status`;
      const responseTopic = `${this.baseTopic}/${deviceId}/status/response`;
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.cleanupSubscription(responseTopic);
          reject(new Error('Device status request timeout'));
        }, timeout);

        const subscription = mqtt.subscribe(responseTopic, (message) => {
          clearTimeout(timeoutId);
          this.cleanupSubscription(responseTopic);
          resolve(message);
        });

        mqtt.publish(topic, { 
          type: 'STATUS_REQUEST',
          timestamp: new Date().toISOString(),
          request_id: this.generateRequestId()
        });
      });
    } catch (error) {
      logger.error(`Error getting status for device ${deviceId}:`, error);
      throw error;
    }
  }

  cleanupSubscription(topic) {
    try {
      mqtt.unsubscribe(topic);
    } catch (error) {
      logger.error(`Error cleaning up subscription for topic ${topic}:`, error);
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
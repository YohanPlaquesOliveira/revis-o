class MQTTService {
    async publishToDevice(uniqueId, storeId, posId, payload) {
        const topic = `pos/${uniqueId}/${storeId}/${posId}`;
        
        return new Promise((resolve, reject) => {
            this.client.publish(topic, JSON.stringify(payload), {
                qos: 2,
                retain: false
            }, (error) => {
                if (error) {
                    logger.error('MQTT publish error:', {
                        error: error.message,
                        topic,
                        timestamp: '2025-02-08 18:40:11'
                    });
                    reject(error);
                } else {
                    logger.info('MQTT message published:', {
                        topic,
                        timestamp: '2025-02-08 18:40:11'
                    });
                    resolve();
                }
            });
        });
    }
}
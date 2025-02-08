const mqtt = require('mqtt');
const { logger } = require('../middlewares/logger');

class MQTTService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.config = {
            url: process.env.MQTT_BROKER || 'mqtt://a1420d2d43b14afaab4c24fd1f2c8129.s1.eu.hivemq.cloud',
            port: process.env.MQTT_PORT || 8883,
            username: process.env.MQTT_USERNAME || 'YohanPlaques',
            password: process.env.MQTT_PASSWORD,
            clientId: 'server_' + Math.random().toString(16).substr(2, 8)
        };
    }

    connect() {
        if (this.client) return;

        this.client = mqtt.connect(this.config.url, {
            port: this.config.port,
            username: this.config.username,
            password: this.config.password,
            clientId: this.config.clientId,
            clean: true,
            ssl: true
        });

        this.client.on('connect', () => {
            this.connected = true;
            logger.info('Conectado ao broker MQTT');
        });

        this.client.on('error', (error) => {
            logger.error('Erro MQTT:', error);
            this.connected = false;
        });

        this.client.on('message', (topic, message) => {
            try {
                const data = JSON.parse(message.toString());
                logger.debug('Mensagem MQTT recebida:', { topic, data });
            } catch (error) {
                logger.error('Erro ao processar mensagem MQTT:', error);
            }
        });
    }

    async publishToDevice(uniqueId, message) {
        if (!this.connected) {
            await this.connect();
        }

        const topic = `devices/${uniqueId}`;
        const messageStr = JSON.stringify(message);

        return new Promise((resolve, reject) => {
            this.client.publish(topic, messageStr, { qos: 1 }, (error) => {
                if (error) {
                    logger.error('Erro ao publicar mensagem:', error);
                    reject(error);
                } else {
                    logger.debug('Mensagem publicada:', { topic, message });
                    resolve();
                }
            });
        });
    }
}

module.exports = new MQTTService();
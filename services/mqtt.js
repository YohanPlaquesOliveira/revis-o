class MQTTService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 5000;
    }

    async connect() {
        if (this.client && this.connected) return;

        return new Promise((resolve, reject) => {
            this.client = mqtt.connect(this.config.url, {
                ...this.config,
                will: {
                    topic: 'server/status',
                    payload: JSON.stringify({ status: 'offline' }),
                    qos: 1,
                    retain: true
                }
            });

            this.client.on('connect', () => {
                this.connected = true;
                this.reconnectAttempts = 0;
                logger.info('Connected to MQTT broker');
                resolve();
            });

            this.client.on('error', (error) => {
                logger.error('MQTT error:', error);
                this.handleReconnect();
                reject(error);
            });

            this.client.on('close', () => {
                this.connected = false;
                this.handleReconnect();
            });
        });
    }

    async handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        setTimeout(() => {
            logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect();
        }, this.reconnectInterval);
    }
}
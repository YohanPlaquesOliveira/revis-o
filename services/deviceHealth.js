class DeviceHealthService {
    constructor() {
        this.devices = new Map();
        this.healthCheckInterval = 30000; // 30 segundos
    }

    startMonitoring(deviceId) {
        if (this.devices.has(deviceId)) return;

        const device = {
            id: deviceId,
            lastSeen: Date.now(),
            status: 'online',
            healthCheck: setInterval(() => this.checkDeviceHealth(deviceId), this.healthCheckInterval)
        };

        this.devices.set(deviceId, device);
    }

    updateDeviceStatus(deviceId) {
        const device = this.devices.get(deviceId);
        if (device) {
            device.lastSeen = Date.now();
            device.status = 'online';
        }
    }

    async checkDeviceHealth(deviceId) {
        const device = this.devices.get(deviceId);
        if (!device) return;

        const timeSinceLastSeen = Date.now() - device.lastSeen;
        if (timeSinceLastSeen > this.healthCheckInterval * 2) {
            device.status = 'offline';
            await this.handleDeviceOffline(deviceId);
        }
    }

    async handleDeviceOffline(deviceId) {
        logger.warn(`Device ${deviceId} is offline`);
        // Implementar lógica de notificação
    }
}

module.exports = new DeviceHealthService();
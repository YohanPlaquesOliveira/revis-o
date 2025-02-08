const Device = require('../models/device');
const Store = require('../models/store');
const Account = require('../models/account');
const { ValidationError } = require('../utils/errors');
const logger = require('../middlewares/logger');

class DeviceService {
  async register(deviceData) {
    try {
      const device = await Device.create({
        ...deviceData,
        created_by: 'YohanPlaques',
        created_at: '2025-02-08 03:46:40'
      });

      await this.setupDeviceIntegration(device);
      
      return device;
    } catch (error) {
      logger.error('Error registering device:', error);
      throw error;
    }
  }

  async update(id, deviceData) {
    const device = await Device.findByPk(id);
    if (!device) {
      throw new ValidationError('Device not found');
    }

    await device.update(deviceData);
    return device;
  }

  async setupDeviceIntegration(device) {
    const store = await Store.findByPk(device.store_id);
    const account = await Account.findOne({ where: { store_id: store.id } });

    // Setup device integration with MP
    // Additional integration logic here
  }
}

module.exports = new DeviceService();
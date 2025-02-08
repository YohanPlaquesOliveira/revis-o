const Device = require('../models/device');
const Store = require('../models/store');
const Account = require('../models/account');
const { ValidationError } = require('../utils/errors');
const logger = require('../middlewares/logger');
const mercadoPagoService = require('./mercadoPagoService');

class DeviceService {
  async register(deviceData) {
    const transaction = await Device.sequelize.transaction();

    try {
      // Verificar dispositivo duplicado
      const existingDevice = await Device.findOne({
        where: {
          serial_number: deviceData.serial_number,
          store_id: deviceData.store_id
        },
        transaction
      });

      if (existingDevice) {
        throw new ValidationError('Device already registered');
      }

      // Verificar store
      const store = await Store.findByPk(deviceData.store_id, {
        include: [Account],
        transaction
      });

      if (!store) {
        throw new ValidationError('Store not found');
      }

      if (!store.Account) {
        throw new ValidationError('Store has no associated account');
      }

      // Criar dispositivo
      const device = await Device.create({
        ...deviceData,
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      // Configurar integração
      await this.setupDeviceIntegration(device, store, transaction);
      
      await transaction.commit();
      return device;

    } catch (error) {
      await transaction.rollback();
      logger.error('Error registering device:', error);
      throw error;
    }
  }

  async setupDeviceIntegration(device, store, transaction) {
    try {
      // Registrar dispositivo no Mercado Pago
      const mpDevice = await mercadoPagoService.registerDevice({
        store_id: store.id,
        external_id: device.id,
        device_id: device.serial_number,
        access_token: store.Account.mp_access_token
      });

      // Atualizar device com dados do MP
      await device.update({
        mp_device_id: mpDevice.id,
        status: 'active',
        integration_data: mpDevice,
        updated_at: new Date()
      }, { transaction });

      logger.info('Device integration completed:', {
        deviceId: device.id,
        mpDeviceId: mpDevice.id
      });

    } catch (error) {
      logger.error('Error in device integration:', error);
      throw new ValidationError('Failed to integrate device with Mercado Pago');
    }
  }
}

module.exports = new DeviceService();
const deviceService = require('../services/deviceService');
const endpointsService = require('../services/endpointsService');
const logger = require('../middlewares/logger');

class RegisterController {
  async registerDevice(req, res, next) {
    try {
      const deviceData = {
        ...req.body,
        created_by: 'YohanPlaques',
        created_at: '2025-02-08 03:51:56'
      };

      logger.info('Registering new device:', deviceData);

      const device = await deviceService.register(deviceData);

      // Registrar endpoints do dispositivo
      if (req.body.endpoints) {
        await endpointsService.create({
          device_id: device.id,
          ...req.body.endpoints,
          created_by: 'YohanPlaques',
          created_at: '2025-02-08 03:51:56'
        });
      }

      res.status(201).json(device);
    } catch (error) {
      logger.error('Error registering device:', error);
      next(error);
    }
  }

  async updateDevice(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        updated_by: 'YohanPlaques',
        updated_at: '2025-02-08 03:51:56'
      };

      logger.info(`Updating device ${id}:`, updateData);

      const device = await deviceService.update(id, updateData);

      // Atualizar endpoints se fornecidos
      if (req.body.endpoints) {
        await endpointsService.update(id, req.body.endpoints);
      }

      res.json(device);
    } catch (error) {
      logger.error('Error updating device:', error);
      next(error);
    }
  }
}

module.exports = new RegisterController();
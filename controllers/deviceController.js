const deviceService = require('../services/deviceService');
const logger = require('../middlewares/logger');

class DeviceController {
  async register(req, res, next) {
    try {
      const device = await deviceService.register({
        ...req.body,
        created_by: 'YohanPlaques',
        created_at: '2025-02-08 03:51:01'
      });

      logger.info('Device registered:', { 
        deviceId: device.id, 
        storeId: device.store_id 
      });

      res.status(201).json(device);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const device = await deviceService.update(req.params.id, req.body);
      
      logger.info('Device updated:', {
        deviceId: device.id,
        changes: req.body
      });

      res.json(device);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      const status = await deviceService.getStatus(req.params.id);
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  async sendCommand(req, res, next) {
    try {
      const { command, payload } = req.body;
      await deviceService.sendCommand(req.params.id, command, payload);
      
      logger.info('Command sent to device:', {
        deviceId: req.params.id,
        command,
        payload
      });

      res.json({ message: 'Command sent successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeviceController();
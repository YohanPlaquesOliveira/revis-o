const deviceService = require('../services/deviceService');
const endpointsService = require('../services/endpointsService');
const logger = require('../middlewares/logger');
const { ValidationError } = require('../utils/errors');
const { validate } = require('../utils/validator');

class RegisterController {
  async registerDevice(req, res, next) {
    const transaction = await deviceService.startTransaction();

    try {
      // Validar dados de entrada
      const validationSchema = {
        store_id: { type: 'number', required: true },
        model: { type: 'string', required: true, min: 2, max: 50 },
        firmware_version: { type: 'string', pattern: /^\d+\.\d+\.\d+$/ },
        settings: { type: 'object' }
      };

      const errors = validate(req.body, validationSchema);
      if (errors.length) {
        throw new ValidationError('Invalid input data', errors);
      }

      // Preparar dados do dispositivo
      const deviceData = {
        ...req.body,
        created_by: req.user?.id || 'system',
        created_at: new Date(),
        status: 'pending'
      };

      logger.info('Registering new device:', {
        ...deviceData,
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      });

      // Registrar dispositivo
      const device = await deviceService.register(deviceData, transaction);

      // Registrar endpoints se fornecidos
      if (req.body.endpoints) {
        const endpointSchema = {
          notification_url: { type: 'string', required: true, format: 'url' },
          success_url: { type: 'string', format: 'url' },
          failure_url: { type: 'string', format: 'url' },
          webhook_secret: { type: 'string', min: 32 }
        };

        const endpointErrors = validate(req.body.endpoints, endpointSchema);
        if (endpointErrors.length) {
          throw new ValidationError('Invalid endpoint data', endpointErrors);
        }

        await endpointsService.create({
          device_id: device.id,
          ...req.body.endpoints,
          created_by: req.user?.id || 'system',
          created_at: new Date()
        }, transaction);
      }

      await transaction.commit();

      // Emitir evento de dispositivo registrado
      await deviceService.emitDeviceRegistered(device);

      res.status(201).json({
        success: true,
        data: device,
        message: 'Device registered successfully'
      });

    } catch (error) {
      await transaction.rollback();

      logger.error('Error registering device:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });

      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          errors: error.errors,
          message: error.message
        });
      }

      next(error);
    }
  }

  async updateDevice(req, res, next) {
    const transaction = await deviceService.startTransaction();

    try {
      const { id } = req.params;

      // Validar ID
      if (!id || isNaN(id)) {
        throw new ValidationError('Invalid device ID');
      }

      // Validar dados de atualização
      const updateSchema = {
        model: { type: 'string', min: 2, max: 50 },
        firmware_version: { type: 'string', pattern: /^\d+\.\d+\.\d+$/ },
        settings: { type: 'object' },
        status: { type: 'string', enum: ['active', 'inactive', 'maintenance'] }
      };

      const errors = validate(req.body, updateSchema);
      if (errors.length) {
        throw new ValidationError('Invalid update data', errors);
      }

      const updateData = {
        ...req.body,
        updated_by: req.user?.id || 'system',
        updated_at: new Date()
      };

      logger.info(`Updating device ${id}:`, {
        ...updateData,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });

      const device = await deviceService.update(id, updateData, transaction);

      // Atualizar endpoints se fornecidos
      if (req.body.endpoints) {
        await endpointsService.update(id, {
          ...req.body.endpoints,
          updated_by: req.user?.id || 'system'
        }, transaction);
      }

      await transaction.commit();

      // Emitir evento de dispositivo atualizado
      await deviceService.emitDeviceUpdated(device);

      res.json({
        success: true,
        data: device,
        message: 'Device updated successfully'
      });

    } catch (error) {
      await transaction.rollback();

      logger.error('Error updating device:', {
        error: error.message,
        stack: error.stack,
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });

      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          errors: error.errors,
          message: error.message
        });
      }

      next(error);
    }
  }
}

module.exports = new RegisterController();
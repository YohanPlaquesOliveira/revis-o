const Endpoints = require('../models/endpoints');
const { ValidationError } = require('../utils/errors');
const logger = require('../middlewares/logger');

class EndpointsService {
  async create(data) {
    try {
      return await Endpoints.create({
        ...data,
        created_by: 'YohanPlaques',
        created_at: '2025-02-08 03:46:40'
      });
    } catch (error) {
      logger.error('Error creating endpoints:', error);
      throw error;
    }
  }

  async update(id, data) {
    const endpoints = await Endpoints.findByPk(id);
    if (!endpoints) {
      throw new ValidationError('Endpoints not found');
    }

    return await endpoints.update(data);
  }

  async getByStoreId(storeId) {
    return await Endpoints.findOne({ where: { store_id: storeId } });
  }
}

module.exports = new EndpointsService();
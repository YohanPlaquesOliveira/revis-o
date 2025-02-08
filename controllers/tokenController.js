const jwt = require('jsonwebtoken');
const config = require('../config/config');
const redisService = require('../services/redis');
const logger = require('../middlewares/logger');

class TokenController {
  async generateToken(req, res, next) {
    try {
      const { store_id, device_id } = req.body;
      
      const token = jwt.sign(
        {
          store_id,
          device_id,
          created_by: 'YohanPlaques',
          created_at: '2025-02-08 03:51:56'
        },
        config[process.env.NODE_ENV || 'development'].security.jwtSecret,
        { expiresIn: '24h' }
      );

      // Armazenar token no Redis
      await redisService.set(`token:${device_id}`, {
        token,
        store_id,
        created_at: '2025-02-08 03:51:56'
      }, 86400); // 24h

      logger.info('Token generated:', { store_id, device_id });

      res.json({ token });
    } catch (error) {
      logger.error('Error generating token:', error);
      next(error);
    }
  }

  async revokeToken(req, res, next) {
    try {
      const { device_id } = req.params;
      
      await redisService.del(`token:${device_id}`);
      
      logger.info('Token revoked:', { device_id });

      res.json({ message: 'Token revoked successfully' });
    } catch (error) {
      logger.error('Error revoking token:', error);
      next(error);
    }
  }

  async validateToken(req, res, next) {
    try {
      const { token } = req.body;
      
      const decoded = jwt.verify(
        token,
        config[process.env.NODE_ENV || 'development'].security.jwtSecret
      );

      // Verificar se token está no Redis
      const storedToken = await redisService.get(`token:${decoded.device_id}`);
      if (!storedToken) {
        throw new Error('Token not found or revoked');
      }

      res.json({ valid: true, decoded });
    } catch (error) {
      res.json({ valid: false, error: error.message });
    }
  }
}

module.exports = new TokenController();
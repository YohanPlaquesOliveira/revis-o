const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('./logger');

class SecurityMiddleware {
  static validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey || apiKey !== config[process.env.NODE_ENV || 'development'].api.key) {
      logger.warn('Invalid API key attempt:', {
        ip: req.ip,
        path: req.path,
        timestamp: '2025-02-08 03:52:41',
        user: 'YohanPlaques'
      });

      return res.status(401).json({
        error: 'Invalid API key'
      });
    }
    
    next();
  }

  static validateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        config[process.env.NODE_ENV || 'development'].security.jwtSecret
      );
      
      req.user = decoded;
      next();
    } catch (error) {
      logger.warn('Invalid token:', {
        error: error.message,
        timestamp: '2025-02-08 03:52:41',
        user: 'YohanPlaques'
      });

      res.status(401).json({
        error: 'Invalid token'
      });
    }
  }

  static validateWebhook(req, res, next) {
    const signature = req.headers['x-mp-signature'];
    
    if (!signature) {
      return res.status(401).json({
        error: 'No webhook signature provided'
      });
    }

    // Implementar validação de assinatura do webhook
    // TODO: Adicionar lógica de verificação

    next();
  }
}

module.exports = SecurityMiddleware;
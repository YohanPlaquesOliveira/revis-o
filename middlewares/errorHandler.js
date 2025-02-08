const logger = require('./logger');
const { ValidationError, DatabaseError } = require('sequelize');
const mercadoPagoErrors = require('../utils/mercadoPagoErrors');

class ErrorHandler {
  static async handle(err, req, res, next) {
    const errorInfo = {
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.id
    };

    // Log do erro
    logger.error('Error occurred:', errorInfo);

    // Monitorar erro (exemplo com uma função hipotética)
    await this.monitorError(err, errorInfo);

    // Tratar erros específicos
    if (err instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    if (err instanceof DatabaseError) {
      return res.status(503).json({
        error: 'Database Error',
        message: 'A database error occurred'
      });
    }

    if (err.name === 'MercadoPagoError') {
      const mpError = mercadoPagoErrors.getErrorInfo(err.code);
      return res.status(mpError.status).json({
        error: mpError.title,
        details: mpError.message
      });
    }

    // Erro genérico
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message,
      requestId: req.id
    });
  }

  static async monitorError(err, info) {
    // Implementar monitoramento de erros
    // Exemplo: enviar para um serviço de monitoramento
  }
}
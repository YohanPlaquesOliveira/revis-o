const { body, param, query, validationResult } = require('express-validator');
const logger = require('./logger');
const { sanitize } = require('express-validator');

class ValidationMiddleware {
  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', {
        errors: errors.array(),
        path: req.path,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString(),
        user: req.user?.id || 'anonymous'
      });

      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }

  static deviceRules() {
    return [
      body('store_id')
        .isInt({ min: 1 })
        .withMessage('Store ID must be a positive integer')
        .toInt(),
      
      body('serial_number')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Serial number is required')
        .matches(/^[A-Za-z0-9-]+$/)
        .withMessage('Serial number contains invalid characters')
        .isLength({ min: 8, max: 32 })
        .withMessage('Serial number must be between 8 and 32 characters'),
      
      body('model')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Device model is required')
        .isLength({ max: 100 })
        .withMessage('Model name is too long'),
      
      body('status')
        .isIn(['active', 'inactive', 'pending', 'maintenance'])
        .withMessage('Invalid status')
        .trim(),
      
      // Sanitização
      sanitize('store_id').toInt(),
      sanitize('serial_number').trim().escape(),
      sanitize('model').trim().escape()
    ];
  }

  static paymentRules() {
    return [
      body('amount')
        .isFloat({ min: 0.01, max: 999999.99 })
        .withMessage('Amount must be between 0.01 and 999999.99')
        .toFloat(),
      
      body('payment_method')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Payment method is required')
        .isIn(['credit_card', 'debit_card', 'pix', 'bank_transfer'])
        .withMessage('Invalid payment method'),
      
      body('installments')
        .optional()
        .isInt({ min: 1, max: 12 })
        .withMessage('Installments must be between 1 and 12')
        .toInt(),
      
      body('description')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Description is too long'),
      
      // Sanitização
      sanitize('description').trim().escape()
    ];
  }

  static refundRules() {
    return [
      body('payment_id')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Payment ID is required')
        .matches(/^[0-9]{10,12}$/)
        .withMessage('Invalid payment ID format'),
      
      body('amount')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0')
        .toFloat(),
      
      body('reason')
        .optional()
        .isString()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Reason is too long'),
      
      // Sanitização
      sanitize('payment_id').trim(),
      sanitize('reason').trim().escape()
    ];
  }

  static paginationRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer')
        .toInt(),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt()
    ];
  }
}

module.exports = ValidationMiddleware;
const { body, validationResult } = require('express-validator');
const logger = require('./logger');

class ValidationMiddleware {
  static validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('Validation errors:', {
        errors: errors.array(),
        path: req.path,
        timestamp: '2025-02-08 03:52:41',
        user: 'YohanPlaques'
      });

      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
  }

  static deviceRules() {
    return [
      body('store_id').isInt().withMessage('Store ID must be an integer'),
      body('serial_number').isString().notEmpty().withMessage('Serial number is required'),
      body('model').isString().notEmpty().withMessage('Device model is required'),
      body('status').isIn(['active', 'inactive']).withMessage('Invalid status')
    ];
  }

  static paymentRules() {
    return [
      body('amount').isFloat({ min: 0.01 }).withMessage('Invalid amount'),
      body('payment_method').isString().notEmpty().withMessage('Payment method is required'),
      body('installments').optional().isInt({ min: 1 }).withMessage('Invalid installments')
    ];
  }

  static refundRules() {
    return [
      body('payment_id').isString().notEmpty().withMessage('Payment ID is required'),
      body('amount').optional().isFloat({ min: 0.01 }).withMessage('Invalid amount')
    ];
  }
}

module.exports = ValidationMiddleware;
const refundService = require('../services/refund');
const logger = require('../middlewares/logger');
const { ValidationError } = require('../utils/errors');

class RefundController {
  async createRefund(req, res, next) {
    try {
      const { payment_id, account_id, amount } = req.body;

      // Validações
      if (!payment_id || !account_id) {
        throw new ValidationError('Missing required fields');
      }

      if (amount && (isNaN(amount) || amount <= 0)) {
        throw new ValidationError('Invalid refund amount');
      }

      logger.info('Refund request received:', {
        paymentId: payment_id,
        accountId: account_id,
        amount,
        requestedBy: req.user?.id || 'system',
        timestamp: new Date().toISOString()
      });

      const refund = await refundService.createRefund(
        payment_id,
        account_id,
        amount
      );

      // Registrar sucesso
      logger.info('Refund created successfully:', {
        refundId: refund.id,
        paymentId: payment_id,
        timestamp: new Date().toISOString()
      });

      res.status(201).json(refund);
    } catch (error) {
      logger.error('Error creating refund:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      next(error);
    }
  }

  async getRefund(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Refund ID is required');
      }

      const refund = await refundService.getRefund(id);
      
      if (!refund) {
        return res.status(404).json({
          error: 'Refund not found'
        });
      }

      res.json(refund);
    } catch (error) {
      logger.error('Error retrieving refund:', {
        error: error.message,
        refundId: req.params.id,
        timestamp: new Date().toISOString()
      });
      next(error);
    }
  }
}

module.exports = new RefundController();
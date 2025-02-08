const refundService = require('../services/refund');
const logger = require('../middlewares/logger');

class RefundController {
  async createRefund(req, res, next) {
    try {
      const { payment_id, account_id, amount } = req.body;

      logger.info('Refund request received:', {
        paymentId: payment_id,
        accountId: account_id,
        amount,
        requestedBy: 'YohanPlaques',
        timestamp: '2025-02-08 03:51:01'
      });

      const refund = await refundService.createRefund(
        payment_id,
        account_id,
        amount
      );

      res.status(201).json(refund);
    } catch (error) {
      next(error);
    }
  }

  async getRefund(req, res, next) {
    try {
      const refund = await refundService.getRefund(req.params.id);
      if (!refund) {
        return res.status(404).json({
          error: 'Refund not found'
        });
      }
      res.json(refund);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RefundController();
const mercadoPagoService = require('./mercadoPagoService');
const Account = require('../models/account');
const Refund = require('../models/refund');
const logger = require('../middlewares/logger');

class RefundService {
  async createRefund(paymentId, accountId, amount = null) {
    try {
      const account = await Account.findByPk(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      const refund = await mercadoPagoService.createRefund(
        paymentId,
        account.mp_access_token,
        amount
      );

      await Refund.create({
        payment_id: paymentId,
        account_id: accountId,
        amount: amount || refund.amount,
        status: refund.status,
        mp_refund_id: refund.id,
        created_by: 'YohanPlaques',
        created_at: '2025-02-08 03:48:50'
      });

      return refund;
    } catch (error) {
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  async getRefund(refundId) {
    try {
      return await Refund.findByPk(refundId);
    } catch (error) {
      logger.error('Error getting refund:', error);
      throw error;
    }
  }
}

module.exports = new RefundService();
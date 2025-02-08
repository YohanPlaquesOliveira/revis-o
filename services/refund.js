const mercadoPagoService = require('./mercadoPagoService');
const Account = require('../models/account');
const Refund = require('../models/refund');
const logger = require('../middlewares/logger');
const { sequelize } = require('../models');

class RefundService {
  async createRefund(paymentId, accountId, amount = null) {
    const transaction = await sequelize.transaction();

    try {
      // Validar valores
      if (amount !== null && (isNaN(amount) || amount <= 0)) {
        throw new Error('Invalid refund amount');
      }

      const account = await Account.findByPk(accountId, { transaction });
      if (!account) {
        throw new Error('Account not found');
      }

      // Verificar se já existe reembolso para este pagamento
      const existingRefund = await Refund.findOne({
        where: { payment_id: paymentId },
        transaction
      });

      if (existingRefund) {
        throw new Error('Payment already refunded');
      }

      const refund = await mercadoPagoService.createRefund(
        paymentId,
        account.mp_access_token,
        amount
      );

      const refundRecord = await Refund.create({
        payment_id: paymentId,
        account_id: accountId,
        amount: amount || refund.amount,
        status: refund.status,
        mp_refund_id: refund.id,
        created_at: new Date(),
        updated_at: new Date()
      }, { transaction });

      await transaction.commit();
      return refundRecord;

    } catch (error) {
      await transaction.rollback();
      logger.error('Error creating refund:', error);
      throw error;
    }
  }

  // ... outros métodos
}
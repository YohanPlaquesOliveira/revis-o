const Account = require('../models/account');
const MerchantOrder = require('../models/merchantOrder');
const mercadoPagoService = require('./mercadoPagoService');
const logger = require('../middlewares/logger');

class IPNService {
  async processNotification(notification) {
    try {
      logger.info('Processing IPN notification:', notification);

      const account = await Account.findOne({
        where: { mp_user_id: notification.user_id }
      });

      if (!account) {
        throw new Error('Account not found for notification');
      }

      switch (notification.type) {
        case 'payment':
          await this.processPayment(notification, account);
          break;
        case 'merchant_order':
          await this.processMerchantOrder(notification, account);
          break;
        default:
          logger.warn('Unhandled notification type:', notification.type);
      }

      return true;
    } catch (error) {
      logger.error('Error processing IPN:', error);
      throw error;
    }
  }

  async processPayment(notification, account) {
    const payment = await mercadoPagoService.getPayment(
      notification.data.id,
      account.mp_access_token
    );

    // Implementar lógica de processamento do pagamento
    logger.info('Payment processed:', payment);
  }

  async processMerchantOrder(notification, account) {
    const order = await MerchantOrder.create({
      mp_id: notification.data.id,
      account_id: account.id,
      status: notification.data.status,
      created_by: 'YohanPlaques',
      created_at: '2025-02-08 03:48:50'
    });

    logger.info('Merchant order processed:', order);
  }
}

module.exports = new IPNService();
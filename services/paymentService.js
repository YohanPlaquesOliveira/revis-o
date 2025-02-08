const mercadoPagoService = require('./mercadoPagoService');
const queueService = require('./queueService');
const Account = require('../models/account');
const Device = require('../models/device');
const logger = require('../middlewares/logger');

class PaymentService {
  async createPayment(paymentData, deviceId) {
    try {
      const device = await Device.findByPk(deviceId, {
        include: [{
          model: Account,
          required: true
        }]
      });

      if (!device) {
        throw new Error('Device not found');
      }

      const payment = await mercadoPagoService.createPayment(
        paymentData,
        device.account.mp_access_token
      );

      // Enfileirar notificação para o dispositivo
      await queueService.add('payment_notification', {
        deviceId,
        paymentId: payment.id,
        status: payment.status,
        timestamp: '2025-02-08 03:48:50'
      });

      return payment;
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async getPaymentStatus(paymentId, accountId) {
    try {
      const account = await Account.findByPk(accountId);
      if (!account) {
        throw new Error('Account not found');
      }

      return await mercadoPagoService.getPayment(
        paymentId,
        account.mp_access_token
      );
    } catch (error) {
      logger.error('Error getting payment status:', error);
      throw error;
    }
  }
}

module.exports = new PaymentService();
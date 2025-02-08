const ipnService = require('../services/ipnService');
const paymentService = require('../services/paymentService');
const logger = require('../middlewares/logger');

class WebhookController {
  async handleWebhook(req, res, next) {
    try {
      const webhook = {
        id: req.body.id,
        type: req.body.type,
        data: req.body.data,
        received_at: '2025-02-08 03:51:56',
        received_by: 'YohanPlaques'
      };

      logger.info('Webhook received:', webhook);

      switch (webhook.type) {
        case 'payment':
          await this.handlePaymentWebhook(webhook);
          break;
        case 'refund':
          await this.handleRefundWebhook(webhook);
          break;
        case 'merchant_order':
          await this.handleMerchantOrderWebhook(webhook);
          break;
        default:
          logger.warn('Unhandled webhook type:', webhook.type);
      }

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      logger.error('Error processing webhook:', error);
      next(error);
    }
  }

  async handlePaymentWebhook(webhook) {
    await paymentService.updatePaymentStatus(
      webhook.data.id,
      webhook.data.status
    );
    
    logger.info('Payment webhook processed:', {
      payment_id: webhook.data.id,
      status: webhook.data.status
    });
  }

  async handleRefundWebhook(webhook) {
    await ipnService.processRefundNotification(webhook.data);
    
    logger.info('Refund webhook processed:', {
      refund_id: webhook.data.id
    });
  }

  async handleMerchantOrderWebhook(webhook) {
    await ipnService.processMerchantOrder(webhook.data);
    
    logger.info('Merchant order webhook processed:', {
      order_id: webhook.data.id
    });
  }
}

module.exports = new WebhookController();
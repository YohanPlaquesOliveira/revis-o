const Account = require('../models/account');
const Payment = require('../models/payment');
const MerchantOrder = require('../models/merchantOrder');
const mercadoPagoService = require('./mercadoPagoService');
const mqttService = require('./mqttService');
const logger = require('../middlewares/logger');

class IPNService {
    async processNotification(topic, id, uniqueId) {
        try {
            logger.info('Processing IPN notification:', {
                topic,
                id,
                uniqueId,
                timestamp: '2025-02-08 18:46:08'
            });

            const account = await Account.findOne({
                where: { unique_id: uniqueId }
            });

            if (!account) {
                throw new Error(`Account not found for uniqueId: ${uniqueId}`);
            }

            switch (topic) {
                case 'payment':
                    return await this.processPayment(id, account);
                case 'merchant_order':
                    return await this.processMerchantOrder(id, account);
                default:
                    logger.warn('Unhandled IPN topic:', { topic });
                    return null;
            }
        } catch (error) {
            logger.error('Error processing IPN:', {
                error: error.message,
                topic,
                id,
                uniqueId,
                timestamp: '2025-02-08 18:46:08'
            });
            throw error;
        }
    }

    async processPayment(paymentId, account) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                const payment = await mercadoPagoService.getPayment(
                    paymentId,
                    account.mp_access_token
                );

                let qrCodeData = null;
                if (payment.payment_method_id === 'pix') {
                    qrCodeData = await mercadoPagoService.getPixQRCode(
                        paymentId,
                        account.mp_access_token
                    );
                }

                const paymentRecord = await Payment.findOrCreate({
                    where: { mp_payment_id: payment.id },
                    defaults: {
                        account_id: account.id,
                        store_id: payment.pos.store_id,
                        pos_id: payment.pos.pos_id,
                        amount: payment.transaction_amount,
                        status: payment.status,
                        payment_method: payment.payment_method_id,
                        payment_data: {
                            ...payment,
                            qr_code: qrCodeData
                        },
                        created_by: 'YohanPlaquesOliveira',
                        created_at: '2025-02-08 18:46:08'
                    }
                });

                await this.notifyDevice(payment, qrCodeData, account);
                return paymentRecord;

            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
    }

    async notifyDevice(payment, qrCodeData, account) {
        const mqttPayload = {
            type: 'payment_notification',
            data: {
                payment_id: payment.id,
                amount: payment.transaction_amount,
                status: payment.status,
                payment_method: payment.payment_method_id,
                timestamp: '2025-02-08 18:46:08'
            }
        };

        if (qrCodeData) {
            mqttPayload.data.qr_code = qrCodeData;
        }

        await mqttService.publishToDevice(
            account.unique_id,
            payment.pos.store_id,
            payment.pos.pos_id,
            mqttPayload
        );
    }
}

module.exports = new IPNService();
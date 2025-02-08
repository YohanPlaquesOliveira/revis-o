const crypto = require('crypto');
const logger = require('../middlewares/logger');
const config = require('../config/config');
const { Account, Payment } = require('../models');
const mercadoPagoService = require('../services/mercadoPagoService');
const mqttService = require('../services/mqttService');

class PaymentNotificationController {
    /**
     * Valida a assinatura do webhook do Mercado Pago
     */
    validateWebhook(req) {
        const signature = req.headers['x-mp-signature'];
        if (!signature) {
            throw new Error('Missing Mercado Pago signature');
        }

        const generatedSignature = crypto
            .createHmac('sha256', config.mercadoPago.webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (signature !== generatedSignature) {
            throw new Error('Invalid webhook signature');
        }

        return true;
    }

    /**
     * Processa notificações IPN do Mercado Pago
     */
    async handleNotification(req, res, next) {
        try {
            // Primeiro valida a assinatura do webhook
            this.validateWebhook(req);

            const { uniqueId } = req.params;
            const { topic, id } = req.query;

            logger.info('IPN notification received:', {
                topic,
                id,
                uniqueId,
                timestamp: '2025-02-08 20:47:47'
            });

            // Localiza a conta
            const account = await Account.findOne({
                where: { unique_id: uniqueId }
            });

            if (!account) {
                throw new Error('Account not found');
            }

            // Processa com base no tipo de notificação
            switch (topic) {
                case 'payment':
                    await this.handlePayment(id, account);
                    break;
                case 'merchant_order':
                    await this.handleMerchantOrder(id, account);
                    break;
                default:
                    logger.warn('Unhandled IPN topic:', {
                        topic,
                        timestamp: '2025-02-08 20:47:47'
                    });
            }
            
            res.status(200).json({ message: 'Notification processed successfully' });
        } catch (error) {
            logger.error('Error processing IPN:', {
                error: error.message,
                timestamp: '2025-02-08 20:47:47'
            });
            next(error);
        }
    }

    /**
     * Processa notificações de pagamento
     */
    async handlePayment(paymentId, account) {
        try {
            const payment = await mercadoPagoService.getPayment(
                paymentId, 
                account.mp_access_token
            );

            // Se for PIX, busca o QR Code
            if (payment.payment_method_id === 'pix') {
                const qrCode = await mercadoPagoService.getPixQRCode(
                    paymentId,
                    account.mp_access_token
                );
                payment.qr_code = qrCode;
            }

            // Salva o pagamento no banco
            await Payment.create({
                mp_payment_id: payment.id,
                account_id: account.id,
                store_id: payment.pos.store_id,
                pos_id: payment.pos.pos_id,
                amount: payment.transaction_amount,
                status: payment.status,
                payment_method: payment.payment_method_id,
                payment_data: payment,
                created_at: '2025-02-08 20:47:47',
                created_by: 'YohanPlaquesOliveira'
            });

            // Notifica o dispositivo ESP32 via MQTT
            await mqttService.publishToDevice(
                account.unique_id,
                payment.pos.store_id,
                payment.pos.pos_id,
                {
                    type: 'payment_notification',
                    data: {
                        payment_id: payment.id,
                        amount: payment.transaction_amount,
                        status: payment.status,
                        payment_method: payment.payment_method_id,
                        qr_code: payment.qr_code,
                        timestamp: '2025-02-08 20:47:47'
                    }
                }
            );
        } catch (error) {
            logger.error('Error handling payment:', {
                error: error.message,
                payment_id: paymentId,
                timestamp: '2025-02-08 20:47:47'
            });
            throw error;
        }
    }

    /**
     * Processa notificações de ordem do merchant
     */
    async handleMerchantOrder(orderId, account) {
        // Implementar lógica para processar merchant orders
        logger.info('Processing merchant order:', {
            order_id: orderId,
            account_id: account.id,
            timestamp: '2025-02-08 20:47:47'
        });
    }
}

module.exports = new PaymentNotificationController();
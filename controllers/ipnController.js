class IPNController {
    async handleNotification(req, res, next) {
        try {
            const { uniqueId } = req.params;
            const { topic, id } = req.query; // IPN envia parâmetros via query

            logger.info('IPN notification received:', {
                topic,
                id,
                uniqueId,
                timestamp: '2025-02-08 18:43:33'
            });

            // 1. Localiza a conta
            const account = await Account.findOne({
                where: { unique_id: uniqueId }
            });

            if (!account) {
                throw new Error('Account not found');
            }

            // 2. Processa com base no tipo de notificação
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
                        timestamp: '2025-02-08 18:43:33'
                    });
            }
            
            res.status(200).json({ message: 'OK' });
        } catch (error) {
            logger.error('Error processing IPN:', {
                error: error.message,
                timestamp: '2025-02-08 18:43:33'
            });
            next(error);
        }
    }

    async handlePayment(paymentId, account) {
        try {
            const payment = await mercadoPagoService.getPayment(
                paymentId, 
                account.mp_access_token
            );

            // Se for PIX, precisamos do QR Code
            if (payment.payment_method_id === 'pix') {
                const qrCode = await mercadoPagoService.getPixQRCode(
                    paymentId,
                    account.mp_access_token
                );
                payment.qr_code = qrCode;
            }

            // Salva o pagamento
            await Payment.create({
                mp_payment_id: payment.id,
                account_id: account.id,
                store_id: payment.pos.store_id,
                pos_id: payment.pos.pos_id,
                amount: payment.transaction_amount,
                status: payment.status,
                payment_method: payment.payment_method_id,
                payment_data: payment,
                created_at: '2025-02-08 18:43:33',
                created_by: 'YohanPlaquesOliveira'
            });

            // Notifica ESP32
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
                        timestamp: '2025-02-08 18:43:33'
                    }
                }
            );
        } catch (error) {
            logger.error('Error handling payment:', {
                error: error.message,
                payment_id: paymentId,
                timestamp: '2025-02-08 18:43:33'
            });
            throw error;
        }
    }
}
async updatePaymentStatus(paymentId, status) {
    try {
        const payment = await Payment.findOne({
            where: { mp_payment_id: paymentId }
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        await payment.update({
            status,
            updated_at: new Date().toISOString(),
            updated_by: process.env.CURRENT_USER
        });

        // Notificar dispositivo sobre mudança de status
        await queueService.add('payment_status_change', {
            deviceId: payment.device_id,
            paymentId,
            status,
            timestamp: new Date().toISOString()
        });

        return payment;
    } catch (error) {
        logger.error('Error updating payment status:', error);
        throw error;
    }
}
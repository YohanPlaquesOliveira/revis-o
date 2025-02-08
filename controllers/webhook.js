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
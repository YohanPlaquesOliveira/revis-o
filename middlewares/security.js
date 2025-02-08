const crypto = require('crypto');
const config = require('../config/config');
const logger = require('./logger');
const redis = require('../services/redis');

class SecurityMiddleware {
    static async validateWebhook(req, res, next) {
        try {
            const signature = req.headers['x-mp-signature'];
            const timestamp = req.headers['x-mp-timestamp'];
            const webhookId = req.headers['x-mp-webhook-id'];
            
            if (!signature || !timestamp || !webhookId) {
                logger.warn('Missing webhook headers:', {
                    headers: req.headers,
                    timestamp: '2025-02-08 18:35:54'
                });
                return res.status(401).json({ error: 'Missing required webhook headers' });
            }

            // Verificar se o webhook não é duplicado
            const webhookKey = `webhook:${webhookId}`;
            const isDuplicate = await redis.get(webhookKey);
            if (isDuplicate) {
                logger.warn('Duplicate webhook received:', { webhookId });
                return res.status(200).json({ message: 'Webhook already processed' });
            }

            // Verificar se o timestamp não é muito antigo (máx 5 minutos)
            const webhookTime = new Date(Number(timestamp));
            const now = new Date();
            if (now - webhookTime > 5 * 60 * 1000) {
                logger.warn('Webhook timestamp too old:', {
                    webhookTime,
                    now: '2025-02-08 18:35:54'
                });
                return res.status(401).json({ error: 'Webhook timestamp expired' });
            }

            // Validar assinatura
            const payload = JSON.stringify(req.body);
            const expectedSignature = crypto
                .createHmac('sha256', config[process.env.NODE_ENV || 'development'].security.webhookSecret)
                .update(`${webhookId}${timestamp}${payload}`)
                .digest('hex');

            if (signature !== expectedSignature) {
                logger.warn('Invalid webhook signature:', {
                    received: signature,
                    expected: expectedSignature,
                    timestamp: '2025-02-08 18:35:54'
                });
                return res.status(401).json({ error: 'Invalid webhook signature' });
            }

            // Armazenar webhook ID para evitar duplicatas (TTL de 1 hora)
            await redis.set(webhookKey, '1', 'EX', 3600);

            next();
        } catch (error) {
            logger.error('Webhook validation error:', {
                error: error.message,
                timestamp: '2025-02-08 18:35:54'
            });
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = SecurityMiddleware;
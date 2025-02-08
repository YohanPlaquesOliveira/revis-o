const express = require('express');
const router = express.Router();
const ipnService = require('../services/ipnService');
const logger = require('../middlewares/logger');

router.post('/:uniqueId/notification', async (req, res) => {
    try {
        const { uniqueId } = req.params;
        const { topic, id } = req.query;

        if (!topic || !id) {
            return res.status(400).json({
                error: 'Missing required IPN parameters'
            });
        }

        await ipnService.processNotification(topic, id, uniqueId);
        res.status(200).json({ message: 'OK' });

    } catch (error) {
        logger.error('IPN processing error:', {
            error: error.message,
            timestamp: '2025-02-08 18:46:08',
            user: 'YohanPlaquesOliveira'
        });
        
        // Sempre retorna 200 para o Mercado Pago, mesmo em caso de erro
        res.status(200).json({ message: 'Notification received' });
    }
});

module.exports = router;
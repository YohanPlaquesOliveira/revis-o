const express = require('express');
const router = express.Router();
const { validateToken } = require('../middlewares/auth');
const { logger } = require('../middlewares/logger');
const Account = require('../models/account');
const mqtt = require('../services/mqtt');

// Rota para configuração do token
router.post('/config/token', async (req, res) => {
    try {
        const { accessToken } = req.body;
        
        if (!accessToken) {
            return res.status(400).json({ message: 'Access Token é obrigatório' });
        }

        // Valida o token com o Mercado Pago
        const mpResponse = await validateToken(accessToken);
        
        if (!mpResponse.valid) {
            return res.status(401).json({ message: 'Token inválido' });
        }

        // Cria ou atualiza a conta
        const account = await Account.createOrUpdate({
            mp_access_token: accessToken,
            mp_user_id: mpResponse.userId,
            mp_store_id: mpResponse.storeId,
            mp_pos_id: mpResponse.posId,
            status: 'active'
        });

        // Notifica o ESP32 via MQTT
        await mqtt.publishToDevice(account.uniqueId, {
            command: 'config_update',
            storeId: account.mp_store_id,
            posId: account.mp_pos_id
        });

        res.json({
            uniqueId: account.uniqueId,
            message: 'Configuração realizada com sucesso'
        });

    } catch (error) {
        logger.error('Erro na configuração do token:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});

module.exports = router;
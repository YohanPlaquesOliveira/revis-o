const { logger } = require('./logger');

async function validateToken(accessToken) {
    try {
        // Fazer requisição para o Mercado Pago para validar o token
        const response = await fetch('https://api.mercadopago.com/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            return { valid: false };
        }

        const userData = await response.json();

        // Buscar informações do POS
        const posResponse = await fetch('https://api.mercadopago.com/pos', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!posResponse.ok) {
            return { valid: false };
        }

        const posData = await posResponse.json();
        
        return {
            valid: true,
            userId: userData.id,
            storeId: posData.store_id,
            posId: posData.id
        };

    } catch (error) {
        logger.error('Erro na validação do token:', error);
        return { valid: false };
    }
}

module.exports = { validateToken };
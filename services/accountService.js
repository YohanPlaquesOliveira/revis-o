const { v4: uuidv4 } = require('uuid');

class AccountService {
    async register(accessToken) {
        try {
            // Gerar ID único para a conta
            const uniqueId = uuidv4();

            // Configurar webhook no Mercado Pago
            await mercadoPagoService.configureWebhook(accessToken, uniqueId);

            // Criar conta no banco
            const account = await Account.create({
                unique_id: uniqueId,
                mp_access_token: accessToken,
                created_at: new Date().toISOString(),
                created_by: process.env.CURRENT_USER || 'YohanPlaquesOliveira'
            });

            return account;
        } catch (error) {
            logger.error('Error registering account:', error);
            throw error;
        }
    }
}
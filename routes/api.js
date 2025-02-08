router.post('/config/token', async (req, res) => {
    try {
        const { accessToken } = req.body;
        
        // 1. Valida token no Mercado Pago
        const mpValidation = await validateToken(accessToken);
        
        // 2. Gera uniqueId
        const uniqueId = uuidv4();

        // 3. Configura IPN no Mercado Pago primeiro
        const posConfig = await mercadoPagoService.configureIPN(
            accessToken,
            uniqueId
        );

        // 4. Cria ou atualiza conta com os dados do POS
        const account = await Account.create({
            mp_access_token: accessToken,
            mp_user_id: mpValidation.userId,
            mp_store_id: posConfig.store_id,
            mp_pos_id: posConfig.id,
            unique_id: uniqueId,
            external_pos_id: posConfig.external_id,
            status: 'active',
            created_at: '2025-02-08 18:43:33',
            created_by: 'YohanPlaquesOliveira'
        });

        // 5. Registra dispositivo ESP
        const device = await Device.create({
            account_id: account.id,
            store_id: posConfig.store_id,
            pos_id: posConfig.id,
            status: 'active',
            created_at: '2025-02-08 18:43:33',
            created_by: 'YohanPlaquesOliveira'
        });

        res.json({ 
            uniqueId: account.unique_id,
            pos_id: posConfig.id,
            store_id: posConfig.store_id
        });
    } catch (error) {
        logger.error('Error in token configuration:', {
            error: error.message,
            timestamp: '2025-02-08 18:43:33',
            user: 'YohanPlaquesOliveira'
        });
        res.status(500).json({ error: error.message });
    }
});
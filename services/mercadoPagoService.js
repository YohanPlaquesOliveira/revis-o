class MercadoPagoService {
    constructor() {
        this.baseUrl = config[process.env.NODE_ENV || 'development'].api.mercadopago.baseUrl;
        this.timeout = config[process.env.NODE_ENV || 'development'].api.mercadopago.timeout;
        
        this.breaker = new CircuitBreaker(this.makeRequest.bind(this), {
            timeout: this.timeout,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            name: 'mercadopago-api'
        });

        this.setupBreakerEvents();
    }

    // ... outros métodos existentes ...

    async configureIPN(accessToken, uniqueId) {
        try {
            const response = await this.retryRequest(() => 
                this.breaker.fire({
                    method: 'POST',
                    url: `${this.baseUrl}/pos`,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    data: {
                        notification_url: `https://api.seudominio.com/ipn/${uniqueId}/notification`,
                        fixed_amount: true,
                        category: "621102",
                        external_id: uniqueId,
                        notification_type: "ipn"
                    }
                })
            );

            return response.data;
        } catch (error) {
            logger.error('Error configuring IPN:', {
                error: error.message,
                timestamp: '2025-02-08 18:46:08',
                user: 'YohanPlaquesOliveira'
            });
            throw error;
        }
    }

    async getPixQRCode(paymentId, accessToken) {
        try {
            const response = await this.retryRequest(() => 
                this.breaker.fire({
                    method: 'GET',
                    url: `${this.baseUrl}/payments/${paymentId}/qr_code`,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                })
            );

            return response.data;
        } catch (error) {
            logger.error('Error getting PIX QR Code:', {
                error: error.message,
                payment_id: paymentId,
                timestamp: '2025-02-08 18:46:08'
            });
            throw error;
        }
    }
}
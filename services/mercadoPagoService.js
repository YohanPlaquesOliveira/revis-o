const axios = require('axios');
const config = require('../config/config');
const logger = require('../middlewares/logger');

class MercadoPagoService {
  constructor() {
    this.baseUrl = 'https://api.mercadopago.com/v1';
    this.timeout = config.api.timeout;
  }

  async createPayment(paymentData, accessToken) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/payments`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: paymentData,
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      logger.error('Error creating MP payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId, accessToken) {
    try {
      const response = await axios({
        method: 'GET',
        url: `${this.baseUrl}/payments/${paymentId}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      logger.error('Error getting MP payment:', error);
      throw error;
    }
  }

  async createRefund(paymentId, accessToken, amount = null) {
    try {
      const data = amount ? { amount } : {};
      const response = await axios({
        method: 'POST',
        url: `${this.baseUrl}/payments/${paymentId}/refunds`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data,
        timeout: this.timeout
      });

      return response.data;
    } catch (error) {
      logger.error('Error creating MP refund:', error);
      throw error;
    }
  }
}

module.exports = new MercadoPagoService();
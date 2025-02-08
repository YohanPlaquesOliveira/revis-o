const { v4: uuidv4 } = require('uuid');
const Account = require('../models/account');
const MerchantOrder = require('../models/merchantOrder');
const mqttService = require('./mqttService');
const logger = require('../middlewares/logger');

class MerchantOrderService {
    async processOrder(notification) {
        try {
            const { uniqueId } = this.extractUniqueId(notification.url);
            
            const account = await Account.findOne({
                where: { unique_id: uniqueId }
            });

            if (!account) {
                throw new Error('Account not found for unique ID');
            }

            const orderDetails = await this.getOrderDetails(notification, account);
            
            const existingOrder = await this.findExistingOrder(orderDetails);
            
            if (existingOrder) {
                await this.handleExistingOrder(existingOrder, account);
            } else {
                await this.createNewOrder(orderDetails, account);
            }

        } catch (error) {
            logger.error('Error processing merchant order:', error);
            throw error;
        }
    }

    async createNewOrder(orderDetails, account) {
        const mqttTopic = `pos/${account.unique_id}/${orderDetails.store_id}/${orderDetails.pos_id}`;
        
        await MerchantOrder.create({
            ...orderDetails,
            mqtt_topic: mqttTopic,
            created_at: new Date().toISOString(),
            created_by: process.env.CURRENT_USER
        });

        await mqttService.publish(mqttTopic, {
            type: 'payment',
            amount: orderDetails.total_amount,
            status: orderDetails.status
        });
    }

    extractUniqueId(url) {
        const regex = /\/ipn\/([a-f0-9-]+)\//;
        const match = url.match(regex);
        if (!match) {
            throw new Error('Invalid IPN URL format');
        }
        return match[1];
    }
}

module.exports = new MerchantOrderService();
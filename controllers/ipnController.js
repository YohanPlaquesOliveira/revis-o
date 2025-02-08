const ipnService = require('../services/ipnService');
const logger = require('../middlewares/logger');

class IPNController {
  async handleNotification(req, res, next) {
    try {
      const notification = {
        id: req.body.id,
        type: req.body.type,
        data: req.body.data,
        user_id: req.body.user_id,
        received_at: '2025-02-08 03:51:01'
      };

      logger.info('IPN notification received:', notification);

      await ipnService.processNotification(notification);
      
      res.status(200).json({
        message: 'Notification processed successfully'
      });
    } catch (error) {
      logger.error('Error processing IPN:', error);
      next(error);
    }
  }
}

module.exports = new IPNController();
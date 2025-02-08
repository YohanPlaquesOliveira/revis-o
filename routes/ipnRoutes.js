const express = require('express');
const router = express.Router();
const ipnController = require('../controllers/ipnController');
const { validateWebhook } = require('../middlewares/security');
const { rateLimit } = require('../middlewares/rateLimit');

router.post('/notification',
  rateLimit(),
  validateWebhook,
  ipnController.handleNotification
);

module.exports = router;
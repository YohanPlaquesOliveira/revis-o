const express = require('express');
const router = express.Router();
const refundController = require('../controllers/refund');
const { validateApiKey } = require('../middlewares/security');
const { validateRefund } = require('../middlewares/validation');

router.post('/',
  validateApiKey,
  validateRefund,
  refundController.createRefund
);

router.get('/:id',
  validateApiKey,
  refundController.getRefund
);

module.exports = router;
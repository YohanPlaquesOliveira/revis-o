const express = require('express');
const router = express.Router();
const registerController = require('../controllers/registerController');
const { validateDevice } = require('../middlewares/validation');
const { validateApiKey } = require('../middlewares/security');

router.post('/device',
  validateApiKey,
  validateDevice,
  registerController.registerDevice
);

router.put('/device/:id',
  validateApiKey,
  validateDevice,
  registerController.updateDevice
);

module.exports = router;
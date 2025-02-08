const express = require('express');
const router = express.Router();

const healthRoutes = require('./healthRoutes');
const ipnRoutes = require('./ipnRoutes');
const refundRoutes = require('./refund');
const registerRoutes = require('./registerRoutes');
const tokenRoutes = require('./tokenRoutes');

router.use('/', healthRoutes);
router.use('/ipn', ipnRoutes);
router.use('/refund', refundRoutes);
router.use('/register', registerRoutes);
router.use('/token', tokenRoutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const PaymentNotificationController = require('../controllers/PaymentNotificationController');
const auth = require('../middlewares/auth');
const errorHandler = require('../middlewares/errorHandler');
const logger = require('../middlewares/logger');

// Middleware para logging de requisições
router.use((req, res, next) => {
    logger.info('Payment route accessed:', {
        method: req.method,
        path: req.path,
        timestamp: '2025-02-08 20:49:30'
    });
    next();
});

/**
 * @route POST /api/payments/notification/:uniqueId
 * @desc Recebe notificações IPN do Mercado Pago
 * @access Private
 */
router.post('/notification/:uniqueId', 
    auth.validateApiKey, // Middleware de autenticação
    async (req, res, next) => {
        try {
            await PaymentNotificationController.handleNotification(req, res, next);
        } catch (error) {
            logger.error('Payment notification error:', {
                error: error.message,
                uniqueId: req.params.uniqueId,
                timestamp: '2025-02-08 20:49:30'
            });
            next(error);
        }
    }
);

/**
 * @route GET /api/payments/:paymentId
 * @desc Busca detalhes de um pagamento específico
 * @access Private
 */
router.get('/:paymentId',
    auth.validateApiKey,
    async (req, res, next) => {
        try {
            const payment = await Payment.findOne({
                where: { mp_payment_id: req.params.paymentId }
            });

            if (!payment) {
                return res.status(404).json({
                    error: 'Payment not found',
                    timestamp: '2025-02-08 20:49:30'
                });
            }

            res.json(payment);
        } catch (error) {
            logger.error('Error fetching payment:', {
                error: error.message,
                paymentId: req.params.paymentId,
                timestamp: '2025-02-08 20:49:30'
            });
            next(error);
        }
    }
);

/**
 * @route GET /api/payments
 * @desc Lista pagamentos com filtros
 * @access Private
 */
router.get('/',
    auth.validateApiKey,
    async (req, res, next) => {
        try {
            const {
                status,
                payment_method,
                start_date,
                end_date,
                page = 1,
                limit = 10
            } = req.query;

            const where = {};
            if (status) where.status = status;
            if (payment_method) where.payment_method = payment_method;

            if (start_date && end_date) {
                where.created_at = {
                    [Op.between]: [start_date, end_date]
                };
            }

            const payments = await Payment.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                order: [['created_at', 'DESC']]
            });

            res.json({
                payments: payments.rows,
                total: payments.count,
                page: parseInt(page),
                totalPages: Math.ceil(payments.count / parseInt(limit))
            });
        } catch (error) {
            logger.error('Error listing payments:', {
                error: error.message,
                timestamp: '2025-02-08 20:49:30'
            });
            next(error);
        }
    }
);

// Middleware de tratamento de erros
router.use(errorHandler);

module.exports = router;
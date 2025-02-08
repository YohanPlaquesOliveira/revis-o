const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error');
const logger = require('./utils/logger');
const initializeServices = require('./scripts/init');
const config = require('./config/config');

// Criar app Express
const app = express();

// Configurações de segurança
app.use(helmet());
app.use(cors({
    origin: config.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        user: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
    });
    next();
});

// Rotas
app.use('/api', routes);

// Handler de erros
app.use(errorHandler);

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar WebSocket
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    logger.info('New WebSocket connection', {
        timestamp: new Date().toISOString()
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            logger.info('WebSocket message received:', {
                type: data.type,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Error processing WebSocket message:', {
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    ws.on('error', (error) => {
        logger.error('WebSocket error:', {
            error: error.message,
            timestamp: new Date().toISOString()
        });
    });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
    try {
        // Inicializar serviços
        await initializeServices();

        logger.info(`Server running on port ${PORT}`, {
            mode: process.env.NODE_ENV,
            timestamp: new Date().toISOString(),
            user: process.env.CURRENT_USER || 'system'
        });
    } catch (error) {
        logger.error('Failed to initialize services:', {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        process.exit(1);
    }
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', {
        reason: reason,
        promise: promise,
        timestamp: new Date().toISOString()
    });
});

module.exports = server;
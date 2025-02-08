require('dotenv').config();
const express = require('express');
const path = require('path');
const { logger, requestLogger } = require('./middlewares/logger');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware para logs
app.use(requestLogger);

// Middleware para parse do body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (inclui token-manager.html)
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
    logger.error('Erro não tratado:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
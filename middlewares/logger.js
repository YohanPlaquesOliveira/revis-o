const winston = require('winston');
const { createLogger, format, transports } = winston;

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: {
    service: 'mp-pos',
    environment: process.env.NODE_ENV || 'development',
    user: 'YohanPlaques'
  },
  transports: [
    new transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Middleware para logging de requisições
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
      timestamp: '2025-02-08 03:52:41',
      user: 'YohanPlaques'
    });
  });

  next();
};

module.exports = {
  logger,
  requestLogger
};
const winston = require('winston');
require('winston-daily-rotate-file');
const { createLogger, format, transports } = winston;

// Sanitizar dados sensíveis
const sanitizeData = (info) => {
  const sensitiveFields = ['password', 'token', 'api_key', 'access_token'];
  const sanitized = { ...info };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });

  return sanitized;
};

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format(sanitizeData)(),
    format.json()
  ),
  defaultMeta: {
    service: 'mp-pos',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error'
    }),
    new transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});
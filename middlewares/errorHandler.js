const logger = require('./logger');

class ErrorHandler {
  static handle(err, req, res, next) {
    logger.error('Error occurred:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      timestamp: '2025-02-08 03:52:41',
      user: 'YohanPlaques'
    });

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.message
      });
    }

    if (err.name === 'AuthenticationError') {
      return res.status(401).json({
        error: 'Authentication Error',
        details: err.message
      });
    }

    if (err.name === 'NotFoundError') {
      return res.status(404).json({
        error: 'Not Found',
        details: err.message
      });
    }

    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    });
  }
}

module.exports = ErrorHandler;
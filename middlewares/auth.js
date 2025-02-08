const jwt = require('jsonwebtoken');
const { ValidationError } = require('../utils/errors');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
    authenticate: async (req, res, next) => {
        try {
            // Verificar se tem token
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                throw new ValidationError('No authorization token provided');
            }

            // Extrair token
            const [type, token] = authHeader.split(' ');
            if (type !== 'Bearer' || !token) {
                throw new ValidationError('Invalid authorization format');
            }

            // Verificar token
            const decoded = jwt.verify(token, config.jwt.secret);

            // Adicionar dados do usuário à requisição
            req.user = {
                id: decoded.id,
                role: decoded.role,
                timestamp: new Date().toISOString()
            };

            logger.debug('User authenticated:', {
                userId: decoded.id,
                timestamp: new Date().toISOString()
            });

            next();

        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                logger.warn('Invalid token:', {
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({
                    error: 'Invalid token'
                });
            }

            if (error.name === 'TokenExpiredError') {
                logger.warn('Token expired:', {
                    timestamp: new Date().toISOString()
                });
                return res.status(401).json({
                    error: 'Token expired'
                });
            }

            logger.error('Authentication error:', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });

            next(error);
        }
    },

    authorize: (roles = []) => {
        return (req, res, next) => {
            try {
                if (!req.user) {
                    throw new ValidationError('User not authenticated');
                }

                if (roles.length && !roles.includes(req.user.role)) {
                    logger.warn('Unauthorized access attempt:', {
                        userId: req.user.id,
                        requiredRoles: roles,
                        userRole: req.user.role,
                        timestamp: new Date().toISOString()
                    });

                    return res.status(403).json({
                        error: 'Insufficient permissions'
                    });
                }

                next();

            } catch (error) {
                logger.error('Authorization error:', {
                    error: error.message,
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                });

                next(error);
            }
        };
    }
};
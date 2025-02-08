const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../middlewares/logger');

class DatabaseService {
  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.dbConfig = config[this.env].database;
    this.initializeConnection();
  }

  initializeConnection() {
    const options = {
      host: this.dbConfig.host,
      dialect: this.dbConfig.dialect,
      logging: (msg) => logger.debug(msg),
      pool: {
        max: this.env === 'production' ? 20 : 5,
        min: 0,
        acquire: 60000,
        idle: 10000
      },
      retry: {
        max: 3,
        timeout: 30000
      }
    };

    // Adicionar SSL em produção
    if (this.env === 'production') {
      options.dialectOptions = {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      };
    }

    this.sequelize = new Sequelize(
      this.dbConfig.database,
      this.dbConfig.username,
      this.dbConfig.password,
      options
    );

    this.handleConnection();
  }

  handleConnection() {
    this.sequelize.authenticate()
      .then(() => {
        logger.info('Database connection established');
      })
      .catch(error => {
        logger.error('Unable to connect to database:', error);
        // Tentar reconectar após delay
        setTimeout(() => this.handleConnection(), 5000);
      });

    this.sequelize.addHook('beforeConnect', async (config) => {
      logger.debug('Attempting database connection');
    });
  }

  async healthCheck() {
    try {
      await this.sequelize.authenticate();
      return {
        status: 'healthy',
        message: 'Database connection is active'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message
      };
    }
  }
}
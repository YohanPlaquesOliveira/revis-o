const { validateConfig } = require('./configValidator');

const config = {
  development: {
    database: {
      username: process.env.DEV_DB_USER || 'postgres',
      password: process.env.DEV_DB_PASS || 'postgres',
      database: process.env.DEV_DB_NAME || 'mp_pos_dev',
      host: process.env.DEV_DB_HOST || 'localhost',
      dialect: 'postgres',
      logging: true
    },
    // ... outras configs ...
  },
  production: {
    database: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: 'postgres',
      logging: false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '10'),
        min: parseInt(process.env.DB_POOL_MIN || '0'),
        acquire: 30000,
        idle: 10000
      },
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    },
    // ... outras configs ...
  }
};

// Validar configurações
function validateEnvironmentConfig(env) {
  const envConfig = config[env];
  if (!envConfig) {
    throw new Error(`Invalid environment: ${env}`);
  }

  const validationErrors = validateConfig(envConfig);
  if (validationErrors.length > 0) {
    throw new Error(`Invalid configuration: ${validationErrors.join(', ')}`);
  }
  
  return envConfig;
}

module.exports = validateEnvironmentConfig(process.env.NODE_ENV || 'development');
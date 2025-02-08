module.exports = {
  development: {
    database: {
      username: 'postgres',
      password: 'postgres',
      database: 'mp_pos_dev',
      host: 'localhost',
      dialect: 'postgres',
      logging: true
    },
    api: {
      timeout: 30000,
      key: 'dev_api_key_1234',
      mercadopago: {
        baseUrl: 'https://api.mercadopago.com/v1',
        timeout: 30000
      }
    },
    redis: {
      url: 'redis://localhost:6379',
      prefix: 'mp_pos_dev:'
    },
    mqtt: {
      broker: 'mqtt://localhost:1883',
      username: 'mp_pos',
      password: 'dev_mqtt_pass'
    },
    security: {
      jwtSecret: 'dev_jwt_secret_key',
      tokenExpiration: '24h',
      saltRounds: 10
    }
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
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    },
    api: {
      timeout: 30000,
      key: process.env.API_KEY,
      mercadopago: {
        baseUrl: 'https://api.mercadopago.com/v1',
        timeout: 30000
      }
    },
    redis: {
      url: process.env.REDIS_URL,
      prefix: 'mp_pos:'
    },
    mqtt: {
      broker: process.env.MQTT_BROKER,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS
    },
    security: {
      jwtSecret: process.env.JWT_SECRET,
      tokenExpiration: '24h',
      saltRounds: 10
    }
  }
};
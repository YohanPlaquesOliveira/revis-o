const request = require('supertest');
const app = require('../server');
const redis = require('../services/redis');
const db = require('../services/db');
const mqtt = require('../services/mqtt');

describe('Health Check Tests', () => {
  beforeAll(async () => {
    // Garantir que todos os serviços estão inicializados
    await Promise.all([
      redis.connect(),
      db.authenticate(),
      mqtt.connect()
    ]);
  });

  afterAll(async () => {
    // Limpar recursos
    await Promise.all([
      redis.disconnect(),
      db.close(),
      mqtt.disconnect()
    ]);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /health should return 200 when all services are up', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      services: {
        database: 'connected',
        redis: 'connected',
        mqtt: 'connected'
      }
    });
    expect(response.body.timestamp).toBeDefined();
  });

  test('Should handle Redis failure', async () => {
    jest.spyOn(redis, 'ping').mockRejectedValueOnce(new Error('Redis Error'));
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.services.redis).toBe('disconnected');
  });

  // Mais testes...
});
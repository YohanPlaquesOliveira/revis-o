const request = require('supertest');
const app = require('../server');
const redis = require('../services/redis');
const db = require('../services/db');

describe('Health Check Tests', () => {
  test('GET /health should return 200 when all services are up', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('services');
    expect(response.body.services).toHaveProperty('database', 'connected');
    expect(response.body.services).toHaveProperty('redis', 'connected');
    expect(response.body.services).toHaveProperty('mqtt', 'connected');
  });

  test('Health check should report service degradation', async () => {
    // Simulate Redis failure
    jest.spyOn(redis, 'get').mockRejectedValueOnce(new Error('Redis Error'));

    const response = await request(app).get('/health');
    
    expect(response.status).toBe(503);
    expect(response.body.status).toBe('degraded');
    expect(response.body.services.redis).toBe('disconnected');
  });
});
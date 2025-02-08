const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../models');
const Device = require('../models/device');
const Store = require('../models/store');

describe('Testes de Integração', () => {
    beforeAll(async () => {
        // Configurar banco de teste
        await sequelize.sync({ force: true });
        
        // Criar dados de teste
        await Store.create({
            name: 'Loja Teste',
            document: '12345678901234',
            email: 'teste@example.com',
            created_by: 'YohanPlaquesOliveira',
            created_at: '2025-02-08 17:03:27'
        });
    });

    afterAll(async () => {
        // Limpar banco de teste
        await sequelize.drop();
        await sequelize.close();
    });

    describe('Endpoints de Device', () => {
        let deviceId;

        test('POST /api/devices - Criar device', async () => {
            const res = await request(app)
                .post('/api/devices')
                .send({
                    store_id: 1,
                    serial_number: 'TEST123',
                    model: 'Modelo Teste',
                    firmware_version: '1.0.0'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('id');
            deviceId = res.body.id;
        });

        test('GET /api/devices/:id - Buscar device', async () => {
            const res = await request(app)
                .get(`/api/devices/${deviceId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.serial_number).toBe('TEST123');
        });

        test('PUT /api/devices/:id - Atualizar device', async () => {
            const res = await request(app)
                .put(`/api/devices/${deviceId}`)
                .send({
                    firmware_version: '1.0.1'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.firmware_version).toBe('1.0.1');
        });
    });

    describe('Validações', () => {
        test('POST /api/devices - Validar campos obrigatórios', async () => {
            const res = await request(app)
                .post('/api/devices')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toContain('Field \'store_id\' is required');
        });

        test('POST /api/devices - Validar formato serial', async () => {
            const res = await request(app)
                .post('/api/devices')
                .send({
                    store_id: 1,
                    serial_number: 'invalid',
                    model: 'Teste'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toContain('Invalid serial number format');
        });
    });

    describe('Tratamento de Erros', () => {
        test('GET /api/devices/999 - Device não encontrado', async () => {
            const res = await request(app)
                .get('/api/devices/999');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Device not found');
        });

        test('POST /api/devices - Store não existe', async () => {
            const res = await request(app)
                .post('/api/devices')
                .send({
                    store_id: 999,
                    serial_number: 'TEST999',
                    model: 'Teste'
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Store not found');
        });
    });
});
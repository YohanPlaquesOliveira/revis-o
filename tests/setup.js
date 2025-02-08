// Unificar configurações de jest.setup.js e tests_setup.js
const setupDatabase = require('./database-setup');
const setupMocks = require('./mocks-setup');

module.exports = async () => {
    await setupDatabase();
    await setupMocks();
    // ... outras configurações
};
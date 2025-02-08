module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverages: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 10000,
  verbose: true
};
/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  coverageReporters: ['json-summary', 'text', 'lcov'],
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  setupFiles: ['./src/.jest/envVars.ts'],
};

export default config;

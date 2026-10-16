/**
 * Shared Jest base configuration for all packages in this monorepo.
 * Handles ESM-only dependencies (e.g. uuid@14+) that need transformation.
 *
 * Usage in package jest.config.js:
 *   const baseConfig = require('../../jest.base');  // adjust relative path
 *   module.exports = { ...baseConfig };
 */
const { defaults } = require('jest-config');

module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '.+/node_modules/.+\\.js$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*uuid)'
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  testEnvironment: 'node'
};

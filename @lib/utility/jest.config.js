const { defaults } = require('jest-config');

module.exports = {
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }]
  },
  moduleNameMapper: {
    '^@ace-clublabs/iss-common-util(.*)$': '<rootDir>/../../node_modules/@ace-clublabs/iss-common-util/dist$1',
    '^uuid$': '<rootDir>/src/__mocks__/uuid.js'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  testEnvironment: 'node',
  globalSetup: './global-setup.js'
};

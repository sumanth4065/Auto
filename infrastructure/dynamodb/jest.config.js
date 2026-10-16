const { defaults } = require('jest-config');

module.exports = {
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts$',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts'],
  testEnvironment: 'node',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/bin/'
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/**/*.d.ts',
    '!lib/**/*.test.ts'
  ]
};

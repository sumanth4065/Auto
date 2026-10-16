const baseConfig = require('../../../jest.base');

module.exports = {
  ...baseConfig,
  moduleNameMapper: {
    '^@ace-clublabs/iss-common-util$': '<rootDir>/../../../node_modules/@ace-clublabs/iss-common-util/dist/index.js'
  }
};

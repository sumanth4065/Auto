const { randomUUID } = require('crypto');
const v4 = () => randomUUID();
module.exports = { v4 };
module.exports.v4 = v4;

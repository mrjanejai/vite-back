const knex = require('knex');
const moment = require('moment');
const config = require('./config').dbhos;
const util = require('./util');

const knexInstance = knex({
  client: 'mysql',
  connection: {
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    port: config.port,
  },
  pool: { min: 0, max: 10 },
  wrapIdentifier: (value) => value
});

module.exports = knexInstance;

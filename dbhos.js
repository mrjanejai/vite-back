const Sequelize = require('sequelize')
const knex = require('knex')
const moment = require('moment')
const config = require('./config').dbhos
const util = require('./util')

module.exports.knex2 = knex({
  client: 'mysql',
  wrapIdentifier: (value) => value
})

module.exports.db2 = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  define: {
    timestamps: false,
    freezeTableName: true
  },
  quoteIdentifiers: false,
  logging: false,
  timezone: moment().format('Z'),
  dialectOptions: {
    typeCast: util.formatData.bind(util)
  }
})
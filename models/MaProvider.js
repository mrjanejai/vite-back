const Sequelize = require('sequelize')
const { db } = require('../db')

module.exports = db.define('MaProvider', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider_name: Sequelize.STRING,
  active: Sequelize.STRING,
  create_user: Sequelize.INTEGER,
  create_date: Sequelize.DATE,
  update_user: Sequelize.INTEGER,
  update_date: Sequelize.DATE,
})
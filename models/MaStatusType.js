const Sequelize = require('sequelize')
const { db } = require('../db')

module.exports = db.define('MaStatusType', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  status_name: Sequelize.STRING,
  priority: Sequelize.STRING,
  create_user: Sequelize.INTEGER,
  create_date: Sequelize.DATE,
  update_user: Sequelize.INTEGER,
  update_date: Sequelize.DATE,
})
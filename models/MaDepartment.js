const Sequelize = require('sequelize')
const { db } = require('../db')

module.exports = db.define('MaDepartment', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  department: Sequelize.STRING,
  create_user: Sequelize.INTEGER,
  create_date: Sequelize.DATE,
  update_user: Sequelize.INTEGER,
  update_date: Sequelize.DATE,
})
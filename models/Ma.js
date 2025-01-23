const Sequelize = require('sequelize')
const { db } = require('../db')

module.exports = db.define('Ma', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ma_topic: Sequelize.STRING,
  ma_type: Sequelize.INTEGER,
  hw_id: Sequelize.STRING,
  ma_detail: Sequelize.STRING,
  report_by: Sequelize.STRING,
  department: Sequelize.INTEGER,
  report_date: Sequelize.DATE,
  status_type: Sequelize.INTEGER,
  resolve_by: Sequelize.INTEGER,
  resolve_date: Sequelize.DATE,
  resolve_detail: Sequelize.STRING,
  file_attch: Sequelize.STRING,
  start_job_date: Sequelize.DATE,
  create_user: Sequelize.INTEGER,
  create_date: Sequelize.DATE,
  update_user: Sequelize.INTEGER,
  update_date: Sequelize.DATE,
})
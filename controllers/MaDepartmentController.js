const { knex, db } = require('../db')
const util = require('../util')
const MaDepartment = require('../models/MaDepartment')

exports.index = (req, res, next) => {
  let page = req.query.page || 1
  let size = req.query.size || 10
  let sort = req.query.sort || 'MaDepartment.id'
  let sortDirection = req.query.sort ? (req.query.desc ? 'desc' : 'asc') : 'asc'
  let column = req.query.sc
  let query = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department', 'MaDepartment.create_user')
    .orderBy(sort, sortDirection)
  let columns = query._statements.find(e => e.grouping == 'columns').value
  if (util.isInvalidSearch(columns, column)) {
    return res.sendStatus(403)
  }
  if (req.query.sw) {
    let search = req.query.sw
    let operator = util.getOperator(req.query.so)
    if (operator == 'like') {
      search = `%${search}%`
    }
    query.where(column, operator, search)
  }
  let sqlCount = query.clone().clearSelect().clearOrder().count('* as "count"').toString()
  let sqlQuery = query.offset((page - 1) * size).limit(size).toString()
  Promise.all([
    db.query(sqlCount, { type: 'SELECT', plain: true }),
    db.query(sqlQuery, { type: 'SELECT' })
  ]).then(([count, maDepartments]) => {
    let last = Math.ceil(count.count / size)
    res.send({ maDepartments, last })
  }).catch(next)
}

exports.getCreate = (req, res, next) => {
  res.end()
}

exports.create = (req, res, next) => {
  let maDepartment = util.parseData(MaDepartment, { ...req.body })
  maDepartment.create_user = req.user.id
  maDepartment.create_date = Date.now()
  MaDepartment.create(maDepartment).then(() => {
    res.end()
  }).catch(next)
}

exports.get = (req, res, next) => {
  let sqlMaDepartment = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department')
    .where('MaDepartment.id', req.params.id)
    .toString()
  db.query(sqlMaDepartment, { type: 'SELECT', plain: true }).then(maDepartment => {
    res.send({ maDepartment })
  }).catch(next)
}

exports.edit = (req, res, next) => {
  let sqlMaDepartment = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department')
    .where('MaDepartment.id', req.params.id)
    .toString()
  db.query(sqlMaDepartment, { type: 'SELECT', plain: true }).then(maDepartment => {
    res.send({ maDepartment })
  }).catch(next)
}

exports.update = (req, res, next) => {
  let maDepartment = util.parseData(MaDepartment, { ...req.body })
  maDepartment.update_user = req.user.id
  maDepartment.update_date = Date.now()
  MaDepartment.update(maDepartment, { where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

exports.getDelete = (req, res, next) => {
  let sqlMaDepartment = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department')
    .where('MaDepartment.id', req.params.id)
    .toString()
  db.query(sqlMaDepartment, { type: 'SELECT', plain: true }).then(maDepartment => {
    res.send({ maDepartment })
  }).catch(next)
}

exports.delete = (req, res, next) => {
  MaDepartment.destroy({ where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

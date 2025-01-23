const { knex, db } = require('../db')
const util = require('../util')
const MaType = require('../models/MaType')

exports.index = (req, res, next) => {
  let page = req.query.page || 1
  let size = req.query.size || 10
  let sort = req.query.sort || 'MaType.id'
  let sortDirection = req.query.sort ? (req.query.desc ? 'desc' : 'asc') : 'asc'
  let column = req.query.sc
  let query = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
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
  ]).then(([count, maTypes]) => {
    let last = Math.ceil(count.count / size)
    res.send({ maTypes, last })
  }).catch(next)
}

exports.getCreate = (req, res, next) => {
  res.end()
}

exports.create = (req, res, next) => {
  let maType = util.parseData(MaType, { ...req.body })
  maType.create_user = req.user.id
  maType.create_date = Date.now()
  MaType.create(maType).then(() => {
    res.end()
  }).catch(next)
}

exports.get = (req, res, next) => {
  let sqlMaType = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
    .where('MaType.id', req.params.id)
    .toString()
  db.query(sqlMaType, { type: 'SELECT', plain: true }).then(maType => {
    res.send({ maType })
  }).catch(next)
}

exports.edit = (req, res, next) => {
  let sqlMaType = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
    .where('MaType.id', req.params.id)
    .toString()
  db.query(sqlMaType, { type: 'SELECT', plain: true }).then(maType => {
    res.send({ maType })
  }).catch(next)
}

exports.update = (req, res, next) => {
  let maType = util.parseData(MaType, { ...req.body })
  maType.update_user = req.user.id
  maType.update_date = Date.now()
  MaType.update(maType, { where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

exports.getDelete = (req, res, next) => {
  let sqlMaType = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
    .where('MaType.id', req.params.id)
    .toString()
  db.query(sqlMaType, { type: 'SELECT', plain: true }).then(maType => {
    res.send({ maType })
  }).catch(next)
}

exports.delete = (req, res, next) => {
  MaType.destroy({ where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

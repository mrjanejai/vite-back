const { knex, db } = require('../db')
const util = require('../util')
const MaProvider = require('../models/MaProvider')

exports.index = (req, res, next) => {
  let page = req.query.page || 1
  let size = req.query.size || 10
  let sort = req.query.sort || 'MaProvider.id'
  let sortDirection = req.query.sort ? (req.query.desc ? 'desc' : 'asc') : 'asc'
  let column = req.query.sc
  let query = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name', 'MaProvider.active', 'MaProvider.create_user')
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
  ]).then(([count, maProviders]) => {
    let last = Math.ceil(count.count / size)
    res.send({ maProviders, last })
  }).catch(next)
}

exports.getCreate = (req, res, next) => {
  res.end()
}

exports.create = (req, res, next) => {
  let maProvider = util.parseData(MaProvider, { ...req.body })
  maProvider.create_user = req.user.id
  maProvider.create_date = Date.now()
  MaProvider.create(maProvider).then(() => {
    res.end()
  }).catch(next)
}

exports.get = (req, res, next) => {
  let sqlMaProvider = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name', 'MaProvider.active')
    .where('MaProvider.id', req.params.id)
    .toString()
  db.query(sqlMaProvider, { type: 'SELECT', plain: true }).then(maProvider => {
    res.send({ maProvider })
  }).catch(next)
}

exports.edit = (req, res, next) => {
  let sqlMaProvider = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name', 'MaProvider.active')
    .where('MaProvider.id', req.params.id)
    .toString()
  db.query(sqlMaProvider, { type: 'SELECT', plain: true }).then(maProvider => {
    res.send({ maProvider })
  }).catch(next)
}

exports.update = (req, res, next) => {
  let maProvider = util.parseData(MaProvider, { ...req.body })
  maProvider.update_user = req.user.id
  maProvider.update_date = Date.now()
  MaProvider.update(maProvider, { where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

exports.getDelete = (req, res, next) => {
  let sqlMaProvider = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name', 'MaProvider.active')
    .where('MaProvider.id', req.params.id)
    .toString()
  db.query(sqlMaProvider, { type: 'SELECT', plain: true }).then(maProvider => {
    res.send({ maProvider })
  }).catch(next)
}

exports.delete = (req, res, next) => {
  MaProvider.destroy({ where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

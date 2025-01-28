const { knex, db } = require('../db')
const util = require('../util')
const Ma = require('../models/Ma')

exports.index = (req, res, next) => {
  let page = req.query.page || 1
  let size = req.query.size || 10
  let sort = req.query.sort || 'Ma.id'
  let sortDirection = req.query.sort ? (req.query.desc ? 'desc' : 'asc') : 'desc'
  let column = req.query.sc
  let query = knex('Ma')
    .select('Ma.id', 'Ma.ma_topic', 'Ma.hw_id', 'Ma.ma_detail', 'Ma.report_by', 'Ma.report_date', 'Ma.resolve_date', 'Ma.resolve_detail', 'Ma.file_attch', 'Ma.start_job_date', 'MaType.sla_name as ma_type_sla_name', 'MaDepartment.department as ma_department_department', 'MaStatusType.id as ma_status_type_id', 'MaStatusType.status_name as ma_status_type_status_name', 'MaProvider.provider_name as ma_provider_provider_name')
    .leftJoin('MaType', 'Ma.ma_type', 'MaType.id')
    .leftJoin('MaDepartment', 'Ma.department', 'MaDepartment.id')
    .leftJoin('MaStatusType', 'Ma.status_type', 'MaStatusType.id')
    .leftJoin('MaProvider', 'Ma.resolve_by', 'MaProvider.id')
    .orderBy(sort, sortDirection)
  let columns = query._statements.find(e => e.grouping == 'columns').value
  if (util.isInvalidSearch(columns, column)) {
    return res.sendStatus(403)
  }
  if (req.query.sw) {
    let search = req.query.sw
    let operator = util.getOperator(req.query.so)
    if (column == 'Ma.report_date' || column == 'Ma.resolve_date' || column == 'Ma.start_job_date') {
      search = util.formatDateStr(search)
    }
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
  ]).then(([count, mas]) => {
    let last = Math.ceil(count.count / size)
    res.send({ mas, last })
  }).catch(next)
}

exports.getCreate = (req, res, next) => {
  let sqlMaType = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
    .toString()
  let sqlMaDepartment = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department')
    .toString()
  let sqlMaStatusType = knex('MaStatusType')
    .select('MaStatusType.id', 'MaStatusType.status_name')
    .toString()
  let sqlMaProvider = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name')
    .toString()
  Promise.all([
    db.query(sqlMaType, { type: 'SELECT' }),
    db.query(sqlMaDepartment, { type: 'SELECT' }),
    db.query(sqlMaStatusType, { type: 'SELECT' }),
    db.query(sqlMaProvider, { type: 'SELECT' })
  ]).then(([ maTypes, maDepartments, maStatusTypes, maProviders ]) => {
    res.send({ maTypes, maDepartments, maStatusTypes, maProviders })
  }).catch(next)
}

exports.create = (req, res, next) => {
  let ma = util.parseData(Ma, { ...req.body })
  ma.create_user = req.user.id
  ma.create_date = Date.now()
  Ma.create(ma).then(() => {
    res.end()
  }).catch(next)
}

exports.get = (req, res, next) => {
  let sqlMa = knex('Ma')
    .select('Ma.id', 'Ma.ma_topic', 'Ma.ma_type', 'Ma.hw_id', 'Ma.ma_detail', 'Ma.report_by', 'Ma.department', 'Ma.report_date', 'Ma.status_type', 'Ma.resolve_by', 'Ma.resolve_date', 'Ma.resolve_detail', 'Ma.file_attch', 'Ma.start_job_date')
    .where('Ma.id', req.params.id)
    .toString()
  db.query(sqlMa, { type: 'SELECT', plain: true }).then(ma => {
    res.send({ ma })
  }).catch(next)
}

exports.edit = (req, res, next) => {
  let sqlMa = knex('Ma')
    .select('Ma.id', 'Ma.ma_topic', 'Ma.ma_type', 'Ma.hw_id', 'Ma.ma_detail', 'Ma.report_by', 'Ma.department', 'Ma.report_date', 'Ma.status_type', 'Ma.resolve_by', 'Ma.resolve_date', 'Ma.resolve_detail', 'Ma.file_attch', 'Ma.start_job_date')
    .where('Ma.id', req.params.id)
    .toString()
  let sqlMaType = knex('MaType')
    .select('MaType.id', 'MaType.sla_name')
    .toString()
  let sqlMaDepartment = knex('MaDepartment')
    .select('MaDepartment.id', 'MaDepartment.department')
    .toString()
  let sqlMaStatusType = knex('MaStatusType')
    .select('MaStatusType.id', 'MaStatusType.status_name')
    .toString()
  let sqlMaProvider = knex('MaProvider')
    .select('MaProvider.id', 'MaProvider.provider_name')
    .toString()
  Promise.all([
    db.query(sqlMa, { type: 'SELECT', plain: true }),
    db.query(sqlMaType, { type: 'SELECT' }),
    db.query(sqlMaDepartment, { type: 'SELECT' }),
    db.query(sqlMaStatusType, { type: 'SELECT' }),
    db.query(sqlMaProvider, { type: 'SELECT' })
  ]).then(([ ma, maTypes, maDepartments, maStatusTypes, maProviders ]) => {
    res.send({ ma, maTypes, maDepartments, maStatusTypes, maProviders })
  }).catch(next)
}

exports.update = (req, res, next) => {
  let ma = util.parseData(Ma, { ...req.body })
  ma.update_user = req.user.id
  ma.update_date = Date.now()
  Ma.update(ma, { where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

exports.getDelete = (req, res, next) => {
  let sqlMa = knex('Ma')
    .select('Ma.id', 'Ma.ma_topic', 'Ma.ma_type', 'Ma.hw_id', 'Ma.ma_detail', 'Ma.report_by', 'Ma.department', 'Ma.report_date', 'Ma.status_type', 'Ma.resolve_by', 'Ma.resolve_date', 'Ma.resolve_detail', 'Ma.file_attch', 'Ma.start_job_date')
    .where('Ma.id', req.params.id)
    .toString()
  db.query(sqlMa, { type: 'SELECT', plain: true }).then(ma => {
    res.send({ ma })
  }).catch(next)
}

exports.delete = (req, res, next) => {
  Ma.destroy({ where: { id: req.params.id }}).then(() => {
    res.end()
  }).catch(next)
}

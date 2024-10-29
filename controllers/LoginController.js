const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { knex, db } = require('../db')
const { knex2, db2 } = require('../dbhos')
const { jwtSecret, menu } = require('../config.js')
const util = require('../util')
const User = require('../models/UserAccount')

async function getUserRoles(userId) {
  let sql = knex('UserRole')
    .join('Role', 'Role.id', 'UserRole.role_id')
    .where('UserRole.user_id', userId)
    .select('Role.name as "name"')
    .toString()
  return (await db.query(sql, { type: 'SELECT' })).map(e => e.name)
}

function getMenu(roles) {
  return menu
    .filter(e => e.show && (!e.roles || e.roles.split(',').some(role => roles.includes(role))))
    .map(e => ({
      title: e.title,
      path: e.path,
      subMenu: e.subMenu ? e.subMenu.filter(sub => sub.show && (!sub.roles || sub.roles.split(',').some(role => roles.includes(role)))) : []
    }));
}

exports.user = (req, res) => {
  res.send({
    name: req.user.name,
    menu: getMenu(req.user.roles)
  })
}

// ------------------- LOGIN -------------------
exports.login = async (req, res, next) => {
  const { name, password, hosxp } = req.body;
  if (!name || !password) {
    return res.status(400).send({ message: 'Name and password are required' });
  }

  let user = null; // Ensure user is defined

  if (hosxp) {
    // Check user in dbhos
    let sql = knex2('officer')
      .where('officer_login_name', name)
      .select('officer_id as o_id,officer_name as o_name,officer_login_password_md5 as password')
      .toString();
    let officer = await db2.query(sql, { type: db2.QueryTypes.SELECT }); // Use db2.QueryTypes.SELECT+
    
    if (officer.length && crypto.createHash('md5').update(password).digest('hex').toUpperCase() === officer[0].password) {
      // Assign role id 102 for hosxp users
      let roles = await getUserRoles(officer[0].o_id);
      let token = jwt.sign({ id: officer[0].o_id, name: name, roles }, jwtSecret, { expiresIn: '1d' });
      return res.send({
        token,
        user: {
          name,
          menu: getMenu(roles),
          phosxp: hosxp
        }
      });
    }
  } else {
    // Check user in regular database
    user = await User.findOne({ where: { name } });
    if (user && user.active && bcrypt.compareSync(password, user.password)) {
      let roles = await getUserRoles(user.id);
      let token = jwt.sign({ id: user.id, name: user.name, roles }, jwtSecret, { expiresIn: '1d' });
      return res.send({
        token,
        user: {
          name: user.name,
          menu: getMenu(roles),
          phosxp: hosxp
        }
      });
    }
  }
  let message = (user && !user.active ? 'User is disabled' : 'Invalid credentials');
  res.status(400).send({ message });
}
// ------------------- LOGIN -------------------

exports.logout = (req, res, next) => {
  res.end()
}

exports.resetPassword = async (req, res, next) => {
  let email = req.body.email
  let user = await User.findOne({ where: { email: email } })
  if (user) {
    var token = [...Array(4)].map(() => Math.random().toString(36).substring(2)).join('').substr(0, 40)
    await User.update({ password_reset_token: token }, { where: { id: user.id } })
    await util.sentMail('reset', email, token)
    res.end()
  }
  else {
    res.sendStatus(404)
  }
}

exports.getChangePassword = async (req, res, next) => {
  let user = await User.findOne({ where: { password_reset_token: req.params.token } })
  if (user) {
    res.end()
  }
  else {
    res.sendStatus(404)
  }
}

exports.changePassword = async (req, res, next) => {
  let user = await User.findOne({ where: { password_reset_token: req.params.token } })
  if (user) {
    let data = {
      password: bcrypt.hashSync(req.body.password, 10),
      password_reset_token: null
    }
    await User.update(data, { where: { id: user.id } })
    res.end()
  }
  else {
    res.sendStatus(404)
  }
}
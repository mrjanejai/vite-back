const { knex, db } = require('../db');      // สำหรับการเชื่อมต่อ db.js
const { knex2, db2 } = require('../dbhos'); // สำหรับการเชื่อมต่อ dbhos.js
const util = require('../util')
const UserRole = require('../models/UserRole'); // โมเดล UserRole
const Role = require('../models/Role') // Model สำหรับตาราง Role

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const sort = req.query.sort || 'officer_id';
    const sortDirection = req.query.desc === 'true' ? 'desc' : 'asc';
    const column = req.query.sc;
    let query = knex2('officer')
      .select('officer_id', 'officer_login_name', 'officer_name', 'officer_login_password_md5')
      .where('officer_active','Y')
      .orderBy(sort, sortDirection);
    console.log('im index');

    // ตรวจสอบว่า column ที่ใช้ในการค้นหาถูกต้องหรือไม่
    const columns = query._statements.find(e => e.grouping === 'columns').value;
    if (util.isInvalidSearch(columns, column)) {
      console.log('im in column');
      return res.sendStatus(403);
    }

    // ค้นหาข้อมูลตามคอลัมน์ที่ระบุ (ถ้ามี)
    if (req.query.sw) {
      let search = req.query.sw;
      const operator = util.getOperator(req.query.so);
      if (operator === 'like') {
        search = `%${search}%`;
      }
      console.log(query.where(column, operator, search));
      query.where(column, operator, search);
    }

    // สร้าง SQL สำหรับนับจำนวนทั้งหมดและดึงข้อมูลตามหน้า
    const sqlCount = query.clone().clearSelect().clearOrder().count('* as "count"').toString();
    const sqlQuery = query.offset((page - 1) * size).limit(size).toString();


    // รันทั้งสองคำสั่ง SQL โดยใช้ Promise.all
    const [countResult, officers] = await Promise.all([
      db2.query(sqlCount, { type: db2.QueryTypes.SELECT, plain: true }),
      db2.query(sqlQuery, { type: db2.QueryTypes.SELECT })
    ]);

    const totalRecords = countResult.count;
    const lastPage = Math.ceil(totalRecords / size);

    res.send({
      officers,
      pagination: {
        totalRecords,
        currentPage: page,
        pageSize: size,
        lastPage
      }
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
}

exports.get = (req, res, next) => {
  console.log('get get get');
  // สร้าง SQL query เพื่อดึงข้อมูล officer จาก dbhos
  let sqlOfficer = knex2('officer')
    .select('officer.officer_id', 'officer.officer_name', 'officer.officer_login_name')
    .where('officer.officer_id', req.params.id)
    .toString();

  // สร้าง SQL query เพื่อดึงข้อมูล role ของ officer จาก db หลัก
  let sqlOfficerUserRole = knex('UserRole')
    .join('Role', 'UserRole.role_id', 'Role.id')
    .select('Role.id as role_id', 'Role.name as role_name')
    .where('UserRole.user_id', req.params.id) // ใช้ officer_id เป็น user_id ในกรณีนี้
    .toString();

  // สร้าง SQL query เพื่อดึงรายการ roles ทั้งหมด
  let sqlRoles = knex('Role')
    .select('Role.id', 'Role.name')
    .toString();

  Promise.all([
    db2.query(sqlOfficer, { type: 'SELECT', plain: true }),
    db.query(sqlOfficerUserRole, { type: 'SELECT' }),
    db.query(sqlRoles, { type: 'SELECT' })
  ])
  .then(([officer, officerUserRoles, roles]) => {
    res.send({ officer, officerUserRoles, roles });
  })
  .catch(next);
}

exports.edit = async (req, res, next) => {
  try {
    const officerId = req.params.id
    const { role_id } = req.body

    // ลบ roles ปัจจุบันของ officer
    await UserRole.destroy({ where: { user_id: officerId } })

    // เพิ่ม roles ใหม่ตามที่เลือก
    if (role_id && Array.isArray(role_id)) {
      const newRoles = role_id.map(roleId => ({
        user_id: officerId,
        role_id: roleId
      }))
      await UserRole.bulkCreate(newRoles)
    }

    res.status(200).send({ message: 'Roles updated successfully.' })
  } catch (err) {
    next(err)
  }
};

const { knex, db } = require('../db');      // สำหรับการเชื่อมต่อ db.js
const { knex2, db2 } = require('../dbhos'); // สำหรับการเชื่อมต่อ dbhos.js
const UserRole = require('../models/UserRole'); // โมเดล UserRole

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const sort = req.query.sort || 'officer_id';
    const sortDirection = req.query.desc === 'true' ? 'desc' : 'asc';
    const column = req.query.sc;
    let query = knex2('officer')
      .select('officer_id', 'officer_login_name', 'officer_name', 'officer_login_password_md5')
      .orderBy(sort, sortDirection);

    // ตรวจสอบว่า column ที่ใช้ในการค้นหาถูกต้องหรือไม่
    const columns = query._statements.find(e => e.grouping === 'columns').value;
    if (util.isInvalidSearch(columns, column)) {
      return res.sendStatus(403);
    }

    // ค้นหาข้อมูลตามคอลัมน์ที่ระบุ (ถ้ามี)
    if (req.query.sw) {
      let search = req.query.sw;
      const operator = util.getOperator(req.query.so);
      if (operator === 'like') {
        search = `%${search}%`;
      }
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
    next(error);
  }
}

// ฟังก์ชัน get เพื่อดึงข้อมูลของ officer พร้อม role
exports.get = async (req, res, next) => {
  try {
    // ดึงข้อมูล officer จาก dbhos ตาม officer_id
    const officerSql = knex2('officer')
      .select('officer_id', 'officer_login_name', 'officer_name')
      .where('officer_id', req.params.id)
      .toString();

    const officer = await db2.query(officerSql, { type: db2.QueryTypes.SELECT, plain: true });

    if (!officer) {
      return res.status(404).send({ message: 'Officer not found' });
    }

    // ดึงข้อมูล role ของ officer จาก UserRole และ Role
    const userRoleSql = knex('UserRole')
      .join('Role', 'UserRole.role_id', 'Role.id')
      .select('Role.id as role_id', 'Role.name as role_name')
      .where('UserRole.user_id', req.params.id)
      .toString();

    const roles = await db.query(userRoleSql, { type: db.QueryTypes.SELECT });

    // ดึงรายการ Role ทั้งหมดเพื่อให้เลือก
    const allRolesSql = knex('Role')
      .select('id', 'name')
      .toString();

    const allRoles = await db.query(allRolesSql, { type: db.QueryTypes.SELECT });

    res.send({ officer, roles, allRoles });
  } catch (error) {
    next(error);
  }
};

// ฟังก์ชัน edit เพื่อแก้ไข role ของ officer โดยไม่แก้ไขข้อมูลอื่น
exports.edit = async (req, res, next) => {
  try {
    const { role_id } = req.body;

    // ตรวจสอบว่า officer มีอยู่จริงหรือไม่
    const officerSql = knex2('officer')
      .select('officer_id')
      .where('officer_id', req.params.id)
      .toString();

    const officer = await db2.query(officerSql, { type: db2.QueryTypes.SELECT, plain: true });

    if (!officer) {
      return res.status(404).send({ message: 'Officer not found' });
    }

    // ลบ role เดิมของ officer ที่มีใน UserRole
    await UserRole.destroy({ where: { user_id: req.params.id } });

    // เพิ่ม role ใหม่ตาม role_id ที่ส่งมา
    if (role_id && Array.isArray(role_id)) {
      await UserRole.bulkCreate(
        role_id.map(role => ({
          user_id: req.params.id,
          role_id: role
        }))
      );
    }

    res.send({ message: 'Roles updated successfully' });
  } catch (error) {
    next(error);
  }
};

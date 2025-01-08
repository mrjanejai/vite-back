const { knex2, db2 } = require('../dbhos');  // Import knex2 and db2 from dbhos
const util = require('../util');
 
// exports.index = (req, res, next) => {
//   // ดึง query parameters
//   const page = parseInt(req.query.page) || 1;
//   const size = parseInt(req.query.size) || 10;
//   const sort = req.query.sort || 'o.vn';
//   const sortDirection = req.query.desc === 'true' ? 'desc' : 'asc';
//   const column = req.query.sc;
//   const search = req.query.sw;
//   const operator = req.query.so || '=';

//   // คอลัมน์ที่อนุญาตสำหรับการค้นหาและการจัดเรียง
//   const validColumns = [
//     'p.hn', 'p.cid', 'o.vn', 'o.vstdate', 'o.vsttime', 'k.department', 't.NAME', 'dxtext', 'doctor_dxtext'
//   ];

//   // ตรวจสอบความถูกต้องของ column และ sort
//   if (column && !validColumns.includes(column)) {
//     return res.status(400).send({ error: 'Invalid column for search' });
//   }
//   if (!validColumns.includes(sort)) {
//     return res.status(400).send({ error: 'Invalid column for sorting' });
//   }

//   // สร้าง query ด้วย knex2
//   const query = knex2('ovst as o')
//     .leftJoin('patient as p', 'p.hn', 'o.hn')
//     .leftJoin('visit_pttype as vp', 'vp.vn', 'o.vn')
//     .leftJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
//     .leftJoin('ovst_doctor_diag as od', 'od.vn', 'o.vn')
//     .leftJoin('doctor as dd', 'dd.CODE', 'od.doctor_code')
//     .leftJoin('ovstdiag as dx', 'dx.vn', 'o.vn')
//     .leftJoin('pttype as t', 't.pttype', 'o.pttype')
//     .leftJoin('ovst_seq as oq', 'oq.vn', 'o.vn')
//     .select(
//       'p.hn',
//       'p.cid',
//       knex2.raw('CONCAT_WS("", p.pname, p.fname, " ", p.lname) AS ptname'),
//       'o.vn',
//       'o.vstdate',
//       'o.vsttime',
//       'o.main_dep',
//       'k.department',
//       't.NAME AS pttype_name',
//       knex2.raw('GROUP_CONCAT(DISTINCT od.diag_text ORDER BY od.ovst_doctor_diag_id ASC) AS dxtext'),
//       knex2.raw('GROUP_CONCAT(DISTINCT dd.fname ORDER BY od.ovst_doctor_diag_id ASC) AS doctor_dxtext'),
//       knex2.raw(`
//         (SELECT GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no ASC) 
//          FROM ovstdiag 
//          INNER JOIN icd101 ON icd101.CODE = ovstdiag.icd10 
//          WHERE ovstdiag.diagtype = "1" AND ovstdiag.vn = o.vn) AS pdx
//       `),
//       knex2.raw(`(select GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no asc) from ovstdiag inner join icd101 on icd101.code = ovstdiag.icd10 where ovstdiag.diagtype = '2' and ovstdiag.vn = o.vn) AS dx2`),
//       knex2.raw(`(select GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no asc) from ovstdiag inner join icd101 on icd101.code = ovstdiag.icd10 where ovstdiag.diagtype = '3' and ovstdiag.vn = o.vn) AS dx3`),
//       knex2.raw(`(select GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no asc) from ovstdiag inner join icd101 on icd101.code = ovstdiag.icd10 where ovstdiag.diagtype = '4' and ovstdiag.vn = o.vn) AS dx4`),
//       knex2.raw(`(select GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no asc) from ovstdiag inner join icd101 on icd101.code = ovstdiag.icd10 where ovstdiag.diagtype = '5' and ovstdiag.vn = o.vn) AS dx5`),
//       'oq.nhso_fee_schedule_list_text',
//       knex2.raw(`GROUP_CONCAT(DISTINCT dx.confirm ORDER BY dx.diagtype asc) as confirm`),
//       knex2.raw(`GROUP_CONCAT(DISTINCT dx.confirm_staff ORDER BY dx.diagtype asc) as confirm_staff`)
//     )
//     .whereBetween('o.vstdate', ['2025-01-01', '2025-01-16'])
//     .groupBy('o.vn')
//     .orderBy(sort, sortDirection)
//     .offset((page - 1) * size)
//     .limit(size);

//   // เพิ่มเงื่อนไขการค้นหา
//   if (search) {
//     const formattedSearch = operator === 'like' ? `%${search}%` : search;
//     query.where(column, operator, formattedSearch);
//   }

//   // ใช้ db2 สำหรับการรัน query
//   Promise.all([
//     db2.query(query.clone().clearSelect().clearOrder().count('* as count').toString(), { type: db2.QueryTypes.SELECT }),
//     db2.query(query.toString(), { type: db2.QueryTypes.SELECT })
//   ])
//     .then(([countResult, opdConfirms]) => {
//       const total = countResult[0].count;
//       const lastPage = Math.ceil(total / size);
//       res.send({ opdConfirms, lastPage });
//     })
//     .catch(next);
// }

exports.index = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const sort = req.query.sort || 'vn';
    const sortDirection = req.query.desc === 'true' ? 'desc' : 'asc';
    const column = req.query.sc;

    // สร้างเงื่อนไขแบบ dynamic
    const conditions = [];

    if (req.query.sw) {
      let search = req.query.sw;
      const operator = util.getOperator(req.query.so);
      if (operator === 'like') {
        search = `%${search}%`;
      }
      conditions.push({ column, operator, value: search });
    }

    // สร้างคิวรี
    let query = knex2
      .select('*')
      .from(function () {
        this.select(
          'p.hn',
          'p.cid',
          knex2.raw('CONCAT_WS("", p.pname, p.fname, " ", p.lname) AS ptname'),
          'o.vn',
          'o.vstdate',
          'o.vsttime',
          'o.main_dep',
          'k.department',
          't.NAME AS pttype_name',
          knex2.raw('GROUP_CONCAT(DISTINCT od.diag_text ORDER BY od.ovst_doctor_diag_id ASC) AS dxtext'),
          knex2.raw('GROUP_CONCAT(DISTINCT dd.fname ORDER BY od.ovst_doctor_diag_id ASC) AS doctor_dxtext'),
          knex2.raw(`
            (SELECT GROUP_CONCAT(ovstdiag.icd10 ORDER BY ovstdiag.diag_no ASC) 
             FROM ovstdiag 
             INNER JOIN icd101 ON icd101.CODE = ovstdiag.icd10 
             WHERE ovstdiag.diagtype = "1" AND ovstdiag.vn = o.vn) AS pdx
          `),
          'oq.nhso_fee_schedule_list_text',
          knex2.raw('GROUP_CONCAT(DISTINCT dx.confirm ORDER BY dx.diagtype ASC) AS confirm'),
          knex2.raw('GROUP_CONCAT(DISTINCT dx.confirm_staff ORDER BY dx.diagtype ASC) AS confirm_staff')
        )
          .from('ovst as o')
          .leftJoin('patient as p', 'p.hn', 'o.hn')
          .leftJoin('visit_pttype as vp', 'vp.vn', 'o.vn')
          .leftJoin('kskdepartment as k', 'k.depcode', 'o.main_dep')
          .leftJoin('ovst_doctor_diag as od', 'od.vn', 'o.vn')
          .leftJoin('doctor as dd', 'dd.CODE', 'od.doctor_code')
          .leftJoin('ovstdiag as dx', 'dx.vn', 'o.vn')
          .leftJoin('pttype as t', 't.pttype', 'o.pttype')
          .leftJoin('ovst_seq as oq', 'oq.vn', 'o.vn')
          .whereBetween('o.vstdate', ['2025-01-01', '2025-01-16'])
          .groupBy('o.vn')
          .orderBy('o.vn')
          .as('opdConfirm');
      })
      .orderBy(sort, sortDirection);

    // เพิ่มเงื่อนไขจากอาร์เรย์ conditions
    conditions.forEach((condition) => {
      query = query.where(condition.column, condition.operator, condition.value);
    });

    console.log('Query:', query.toString());

    // สร้าง SQL สำหรับนับจำนวนทั้งหมด
    const sqlCount = query.clone().clearSelect().clearOrder().clearGroup().count('* as "count"').toString();
    const sqlQuery = query.offset((page - 1) * size).limit(size).toString();

    console.log('Count Query:', sqlCount);
    console.log('Data Query:', sqlQuery);

    // รันคำสั่ง SQL
    const [countResult, opdConfirms] = await Promise.all([
      db2.query(sqlCount, { type: db2.QueryTypes.SELECT, plain: true }),
      db2.query(sqlQuery, { type: db2.QueryTypes.SELECT })
    ]);

    const totalRecords = countResult.count;
    const lastPage = Math.ceil(totalRecords / size);

    res.send({
      opdConfirms,
      pagination: {
        totalRecords,
        currentPage: page,
        pageSize: size,
        lastPage,
      },
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
}







exports.getPopulationData = async (req, res, next) => {
  try {
    const result = await knex2('patient as p')
      .select(
        'p.birthday',
        'p.sex',
        'n.nationality',
        knex2.raw(`
          CASE
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702022','5702023','5702026','57020212','57020216') THEN 'รพ.สมเด็จพระญาณสังวร'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702024','5702025','5702027','57020211','57020215','57020217','57020218','57020220') THEN 'รพ.สต.ด้ายกู่แก้ว'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702021','5702028','5702029','57020210','57020213','57020214','57020219') THEN 'รพ.สต.เวียงชัย'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702031','5702034','5702035','5702036','5702038','5702039','57020311','57020312','57020314') THEN 'รพ.สต.ผางาม'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702032','5702033','5702037','57020310','57020313','57020315') THEN 'รพ.สต.ดงมะตื๋น'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702041','5702042','5702043','5702044','5702045','5702046','5702047','5702048','5702049','57020410','57020411','57020412') THEN 'รพ.สต.เวียงเหนือ'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702061','5702062','5702063','5702064','5702065','57020611','57020612','57020614') THEN 'รพ.สต.ช่องลม'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702066','5702067','5702068','5702069','57020610','57020613','57020615','57020616','57020617') THEN 'รพ.สต.ดอนศิลา'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702081','5702082','5702083','5702084','57020811') THEN 'รพ.สต.ดอนแก้ว'
            WHEN CONCAT(p.chwpart, p.amppart, p.tmbpart, p.moopart) IN ('5702085','5702086','5702087','5702088','5702089','57020810') THEN 'รพ.สต.เมืองชุม'
            ELSE 'นอกเขต'
          END as area_type
        `)
      )
      .leftJoin('nationality as n', 'n.nationality', 'p.nationality')
      .leftJoin('thaiaddress as t1', function() {
        this.on('t1.chwpart', 'p.chwpart').andOn('t1.codetype', knex2.raw('?', ['1']));
      })
      .leftJoin('thaiaddress as t2', function() {
        this.on('t2.chwpart', 'p.chwpart').andOn('t2.amppart', 'p.amppart').andOn('t2.codetype', knex2.raw('?', ['2']));
      })
      .leftJoin('thaiaddress as t3', function() {
        this.on('t3.chwpart', 'p.chwpart').andOn('t3.amppart', 'p.amppart').andOn('t3.tmbpart', 'p.tmbpart');
      })
      .where('p.death', '<>', 'Y');
    console.log(result);

    const populationData = {
      male: new Array(21).fill(0),
      female: new Array(21).fill(0),
      nation_thai: new Array(21).fill(0),
      nation_other: new Array(21).fill(0),
      area_in: new Array(21).fill(0),
      area_out: new Array(21).fill(0),
    };
    console.log(populationData);

    result.forEach(row => {
      const birthdate = row.birthday;
      const age = util.calculateAge(birthdate);
      const ageGroup = Math.min(Math.floor(age / 5), 20);
      const nationGroup = Math.min(Math.floor(age / 5), 20);
      const areaGroup = Math.min(Math.floor(age / 5), 20);
      const sex = parseInt(row.sex, 10);
      const nationality = parseInt(row.nationality, 10);

      if (sex === 1) {
        populationData.male[ageGroup]++;
      } else if (sex === 2) {
        populationData.female[ageGroup]++;
      }

      if (nationality === 99) {
        populationData.nation_thai[nationGroup]++;
      } else {
        populationData.nation_other[nationGroup]++;
      }

      if (row.area_type === 'นอกเขต') {
        populationData.area_out[areaGroup]++;
      } else {
        populationData.area_in[areaGroup]++;
      }
    });

    res.json(populationData);
  } catch (err) {
    next(err);
  }
};

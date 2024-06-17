const { knex, dbhos } = require('../dbhos');
const util = require('../util');
const moment = require('moment');

// ฟังก์ชันสำหรับการคิวรี่และคำนวณข้อมูลปิรามิดประชากร
const getPopulationData = async () => {
  try {
    // คิวรี่ข้อมูลวันเกิดและเพศจากตาราง patient
    const result = await knex('patient')
      .select('birthdate', 'sex')
      .then(data => data)
      .catch(err => {
        throw err;
      });

    // สร้างโครงสร้างข้อมูลปิรามิดประชากร
    let populationData = {
      male: new Array(21).fill(0),
      female: new Array(21).fill(0)
    };

    result.forEach(row => {
      // คำนวณอายุจากวันเกิด
      const age = moment().diff(moment(row.birthdate), 'years');
      const ageGroup = Math.min(Math.floor(age / 5), 20); // กลุ่มอายุแบ่งทุก 5 ปี

      // แปลงเพศ
      if (row.sex === 1) {
        populationData.male[ageGroup]++;
      } else if (row.sex === 2) {
        populationData.female[ageGroup]++;
      }
    });

    return populationData;
  } catch (err) {
    throw err;
  }
};

// ฟังก์ชัน index ที่เรียกใช้ getPopulationData
exports.index = async (req, res, next) => {
  try {
    const populationData = await getPopulationData();
    res.json(populationData);
  } catch (err) {
    next(err);
  }
};

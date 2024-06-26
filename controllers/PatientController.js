const { knex2, db2 } = require('../dbhos');
const util = require('../util');

exports.index = (req, res) => {
  res.send('Hosxp index route');
};

exports.getPopulationSex = (req, res, next) => {
  let sqlPopulationSex = knex2('person as ps')
    .select('ps.birthdate', 'ps.sex')
    .where('ps.death', '<>', 'Y')
    .whereIn('ps.house_regist_type_id', [1, 3])
    .toString();

  db2.query(sqlPopulationSex, { type: db2.QueryTypes.SELECT })
    .then(result => {
      const populationData = {
        male: new Array(21).fill(0),
        female: new Array(21).fill(0)
      };

      result.forEach(row => {
        const birthdate = row.birthdate;
        const age = util.calculateAge(birthdate);
        const ageGroup = Math.min(Math.floor(age / 5), 20);
        const sex = parseInt(row.sex, 10);

        if (sex === 1) {
          populationData.male[ageGroup]++;
        } else if (sex === 2) {
          populationData.female[ageGroup]++;
        }
      });

      res.json(populationData);
    })
    .catch(next);
};

exports.getPopulationNationality = (req, res, next) => {
  let sqlPopulationNationality = knex2('person as ps')
    .select('ps.birthdate', 'n.nationality')
    .leftJoin('nationality as n', 'n.nationality', 'ps.nationality')
    .where('ps.death', '<>', 'Y')
    .whereIn('ps.house_regist_type_id', [1, 3])
    .toString();

  db2.query(sqlPopulationNationality, { type: db2.QueryTypes.SELECT })
    .then(result => {
      const populationData = {
        thai: new Array(21).fill(0),
        other: new Array(21).fill(0)
      };

      result.forEach(row => {
        const birthdate = row.birthdate;
        const age = util.calculateAge(birthdate);
        const ageGroup = Math.min(Math.floor(age / 5), 20);
        const nationality = parseInt(row.nationality, 10);

        if (nationality === 99) {
          populationData.thai[ageGroup]++;
        } else {
          populationData.other[ageGroup]++;
        }
      });

      res.json(populationData);
    })
    .catch(next);
};

exports.getPopulationStatus = (req, res, next) => {
  let sqlPopulationStatus = knex2('person as ps')
    .select('ps.birthdate', 'm.code as marrystatus')
    .leftJoin('marrystatus as m', 'm.code', 'ps.marrystatus')
    .where('ps.death', '<>', 'Y')
    .whereIn('ps.house_regist_type_id', [1, 3])
    .toString();

  db2.query(sqlPopulationStatus, { type: db2.QueryTypes.SELECT })
    .then(result => {
      const populationData = {
        single: new Array(21).fill(0),
        married: new Array(21).fill(0),
        widow: new Array(21).fill(0),
        divorced: new Array(21).fill(0),
        separated: new Array(21).fill(0),
        monk: new Array(21).fill(0),
        unknown: new Array(21).fill(0)
      };

      result.forEach(row => {
        const birthdate = row.birthdate;
        const age = util.calculateAge(birthdate);
        const ageGroup = Math.min(Math.floor(age / 5), 20);
        const status = parseInt(row.marrystatus, 10);

        switch (status) {
          case 1:
            populationData.single[ageGroup]++;
            break;
          case 2:
            populationData.married[ageGroup]++;
            break;
          case 3:
            populationData.widow[ageGroup]++;
            break;
          case 4:
            populationData.divorced[ageGroup]++;
            break;
          case 5:
            populationData.separated[ageGroup]++;
            break;
          case 6:
            populationData.monk[ageGroup]++;
            break;
          case 9:
          default:
            populationData.unknown[ageGroup]++;
            break;
        }
      });

      res.json(populationData);
    })
    .catch(next);
};

exports.getPopulationOcc = async (req, res, next) => {
  try {
    // สร้างคำสั่ง SQL ด้วย Knex และแปลงเป็นสตริง
    const sql = knex2('patient as p')
      .select('oc.name as occupation', 'p.sex')
      .leftJoin('occupation as oc', 'oc.occupation', 'p.occupation')
      .where('p.death', '<>', 'Y')
      .toString();

    // รันคำสั่ง SQL ด้วย db2.query
    const result = await db2.query(sql, { type: db2.QueryTypes.SELECT });

    const populationData = {};

    result.forEach(row => {
      if (!populationData[row.occupation]) {
        populationData[row.occupation] = { male: 0, female: 0 };
      }
      if (row.sex === '1') {
        populationData[row.occupation].male++;
      } else if (row.sex === '2') {
        populationData[row.occupation].female++;
      }
    });

    res.json(populationData);
  } catch (err) {
    next(err);
  }
};

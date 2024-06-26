const { knex2, db2 } = require('../dbhos');  // Import knex2 and db2 from dbhos
const util = require('../util');

exports.index = (req, res) => {
  res.send('Hosxp index route');
};

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

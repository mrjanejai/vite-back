const { knex } = require('../dbhos');
const util = require('../util');

exports.index = (req, res) => {
  res.send('Hosxp index route');
};

exports.getPopulationData = async (req, res, next) => {
  try {
    const result = await knex('patient')
      .select('birthday', 'sex');

    const populationData = {
      male: new Array(21).fill(0),
      female: new Array(21).fill(0)
    };

    result.forEach(row => {
      const age = util.calculateAge(row.birthdate);
      const ageGroup = Math.min(Math.floor(age / 5), 20);
      if (row.sex === 1) {
        populationData.male[ageGroup]++;
      } else if (row.sex === 2) {
        populationData.female[ageGroup]++;
      }
    });

    res.json(populationData);
  } catch (err) {
    next(err);
  }
};

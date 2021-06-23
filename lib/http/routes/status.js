const { dataDirManager } = require('../../store');
const { queryRunner } = require('../../query/queryRunner');
const { config } = require('../../config');
const { cache } = require('../../utils/cache');

const status = (req, res) => {
  const response = {
    config,
    dataDirLastUpdate: dataDirManager.getDataDirLastUpdate(),
    query: {
      numberOfExecutions: queryRunner.getCount(),
      numberOfCachedQueries: cache.countItems(),
    },
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

module.exports = { status };

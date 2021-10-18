const { dataDirManager } = require('@lib/store');
const { queryRunner } = require('@lib/query');
const { config } = require('@lib/config');
const { cache } = require('@lib/utils/cache');

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

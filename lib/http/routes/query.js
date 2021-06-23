const microtime = require('microtime');
const { dataDirManager } = require('../../store');
const { queryRunner } = require('../../query/queryRunner');

const index = (req, res) => {
  res.render('queryIndex', {
    queryIds: queryRunner
      .getAvailableQueryIds()
      .map(query => `/query/${query}`),
  });
};

const run = (req, res) => {
  dataDirManager.updateDataDir();
  const args = req.query;
  const queryId = req.params[0];

  let response;
  if (args.benchmark) {
    const benchmark = parseInt(args.benchmark, 10);
    delete args.benchmark;
    const startDate = microtime.now();
    for (let i = 0; i < benchmark; i += 1) {
      response = queryRunner.run(queryId, args);
    }
    response.metadata.execTimeMs = (microtime.now() - startDate) / 1000;
    response.metadata.queriesPerSecond = Math.round(
      1000 / (response.metadata.execTimeMs / benchmark),
    );
  } else {
    response = queryRunner.run(queryId, args);
  }
  res.status(200);
  res.set(response.metadata?.contentType || 'application/json');
  res.send(response);
};

module.exports.query = { index, run };

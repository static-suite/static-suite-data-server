const microtime = require('microtime');
const { dataDirManager } = require('@lib/lib/store');
const { queryRunner } = require('@lib/lib/query');

const index = (req, res) => {
  const queryIds = queryRunner.getAvailableQueryIds();
  res.render('queryIndex', {
    queryIds:
      queryIds.length > 0 ? queryIds.map(query => `/query/${query}`) : null,
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

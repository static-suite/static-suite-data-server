const { dataDirManager } = require('../../store');

const reset = (req, res) => {
  const startDate = Date.now();
  dataDirManager.loadDataDir({ useCache: false });
  const endDate = Date.now();

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send({ execTime: endDate - startDate });
};

module.exports = { reset };

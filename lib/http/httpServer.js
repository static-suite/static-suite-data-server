const express = require('express');
const cors = require('cors');
const { logger } = require('../utils/logger');
const { storeManager } = require('../store');
const { queryRunner } = require('../query/queryRunner');

const httpServer = {
  start: port => {
    const app = express();
    app.use(cors());

    app.get('/', (req, res) => {
      storeManager.updateDataDir();
      const { query } = req.query;
      const args = { ...req.query };
      delete args.query;
      const response = queryRunner.run(query, args);
      res.status(200);
      res.set(response.metadata?.contentType || 'application/json');
      res.send(response);
    });

    app.get('/reset', async (req, res) => {
      const startDate = Date.now();
      storeManager.loadDataDir();
      const endDate = Date.now();

      res.status(200);
      res.set({ 'Content-Type': 'application/json' });
      res.send({ execTime: endDate - startDate });
    });

    app.listen(port, () => {
      logger.info(`Data server listening at http://localhost:${port}`);
    });
  },
};

module.exports.httpServer = httpServer;

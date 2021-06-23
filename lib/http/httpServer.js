const path = require('path');
const express = require('express');
const cors = require('cors');
const { logger } = require('../utils/logger');
const { routes } = require('./routes');

const httpServer = {
  start: port => {
    const app = express();
    app.use(express.static(`${__dirname}/public`));
    app.use(cors());
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.get('/query/*', routes.query.run);
    app.get('/query', routes.query.index);
    app.get('/reset', routes.reset);
    app.get('/status', routes.status);
    app.get(['/data/*', '/data'], routes.data);
    app.get('/docs', routes.docs);
    app.get('/', routes.home);

    app.listen(port, () => {
      logger.info(`Data server listening at http://localhost:${port}`);
    });
  },
};

module.exports.httpServer = httpServer;

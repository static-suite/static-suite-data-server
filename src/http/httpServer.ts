import path from 'path';
import express from 'express';
import cors from 'cors';
import { logger } from '@lib/utils/logger';
import routes from './routes';

export const httpServer = {
  start: (port: number): void => {
    const app = express();
    app.use(express.static(`${__dirname}/public`));
    app.use(cors());
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'pug');

    app.use(routes);

    app.listen(port, () => {
      logger.info(`Data Server listening at http://localhost:${port}`);
    });
  },
};

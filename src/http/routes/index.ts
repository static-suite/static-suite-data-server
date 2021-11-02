import { Router } from 'express';
import { home } from './home';
import { queryIndex, runQuery } from './query';
import { reset } from './reset';
import { status } from './status';
import { data } from './data';
import { docs } from './docs';

const routes = Router();

routes.get('/', home);
routes.get('/docs', docs);
routes.get('/status', status);
routes.get('/reset', reset);
routes.get('/query', queryIndex);
routes.get('/query/*', runQuery);
routes.get(['/data/*', '/data'], data);

export default routes;

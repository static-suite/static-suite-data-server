import { Request, Response } from 'express';
import { version } from '../../../package.json';

export const home = (req: Request, res: Response): void => {
  res.render('home', {
    version,
    links: {
      '/data': 'Browse all data loaded into the server',
      '/dependency': 'Dependency data',
      '/diff': 'Diff operations',
      '/dump': 'Dump operations',
      '/query': 'List of available queries',
      '/task': 'List of available tasks',
      '/cache': 'List of available cache bins',
      '/status': 'All things nerd',
      '/docs': 'Documentation',
    },
  });
};

import { Request, Response } from 'express';

export const home = (req: Request, res: Response): void => {
  res.render('home', {
    links: {
      '/data': 'Browse all data loaded into the server',
      '/dump':
        'Dump resolved data (includes and queries) into the dump directory',
      '/query': 'List of available queries',
      '/task': 'List of available tasks',
      '/cache': 'List of available cache bins',
      '/status': 'All things nerd',
      '/docs': 'Documentation',
    },
  });
};

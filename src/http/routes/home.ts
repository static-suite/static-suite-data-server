import { Request, Response } from 'express';

export const home = (req: Request, res: Response): void => {
  res.render('home', {
    links: {
      '/data': 'Browse all data loaded into the server',
      '/query': 'List of available queries',
      '/cache': 'List of available cache bins',
      '/status': 'All things nerd',
      '/reset': 'Reset the Data Server and load all contents from scratch',
      '/docs': 'Documentation',
    },
  });
};

import { Request, Response } from 'express';
import { diffManager } from '../../lib/store/diff';
import { jsonify } from '../../lib/utils/object';

const diffIndex = (req: Request, res: Response): void => {
  res.render('diffIndex', {
    links: {
      '/diff/incremental': 'Execute an incremental dump',
      '/diff/full': 'Execute a full dump',
      '/diff/reset':
        'Clears intermediate changes tracked by dependency manager',
    },
  });
};

const diffAction = (
  req: Request,
  res: Response,
  incremental: boolean,
): void => {
  const diff = diffManager.getDiff({ incremental });
  const diffAsJson: any = jsonify(diff);

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(diffAsJson);
};

const diffIncremental = (req: Request, res: Response): void => {
  diffAction(req, res, true);
};

const diffFull = (req: Request, res: Response): void => {
  diffAction(req, res, false);
};

const diffReset = (req: Request, res: Response): void => {
  const args: any = req.query;
  if (args?.uniqueId) {
    diffManager.reset(args.uniqueId);
  }
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send({ status: 'done' });
};

export { diffIndex, diffIncremental, diffFull, diffReset };

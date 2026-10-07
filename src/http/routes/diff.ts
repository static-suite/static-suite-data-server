import { Request, Response } from 'express';
import { diffManager } from '../../lib/store/diff';
import { jsonify } from '../../lib/utils/object';

const diffIndex = (req: Request, res: Response): void => {
  res.render('diffIndex', {
    links: {
      '/diff/incremental': 'Execute an incremental diff',
      '/diff/full': 'Execute a full diff',
      '/diff/reset':
        'Clears intermediate changes tracked by dependency manager',
    },
  });
};

const diffAction = async (
  req: Request,
  res: Response,
  incremental: boolean,
): Promise<void> => {
  const diff = await diffManager.getDiff({ incremental });
  const diffAsJson: any = jsonify(diff);

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(diffAsJson);
};

const diffIncremental = async (req: Request, res: Response): Promise<void> => {
  await diffAction(req, res, true);
};

const diffFull = async (req: Request, res: Response): Promise<void> => {
  await diffAction(req, res, false);
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

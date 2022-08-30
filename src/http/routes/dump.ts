import { Request, Response } from 'express';
import { dumpManager } from '@lib/store/dump';

export const diffIndex = (req: Request, res: Response): void => {
  dumpManager.dump();
  const response = {
    result: 'Dump executed',
  };
  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send(response);
};

module.exports = { diffIndex };

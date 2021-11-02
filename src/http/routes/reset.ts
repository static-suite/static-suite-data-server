import { Request, Response } from 'express';

import { dataDirManager } from '@lib/store/dataDir';

export const reset = (req: Request, res: Response) => {
  const startDate = Date.now();
  dataDirManager.load({ incremental: false });
  const endDate = Date.now();

  res.status(200);
  res.set({ 'Content-Type': 'application/json' });
  res.send({ execTime: endDate - startDate });
};

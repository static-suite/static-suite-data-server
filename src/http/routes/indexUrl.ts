import { Request, Response } from 'express';
import { store } from '../../lib/store';
import { logger } from '../../lib/utils/logger';
import { dataDirManager } from '../../lib/store/dataDir';

const indexUrl = (req: Request, res: Response): void => {
  dataDirManager.update();
  const storeKey = req.params[0] === 'index' ? '' : req.params[0];
  const storeFile = store.index.url.get(`/${storeKey}`);

  if (storeFile === undefined) {
    res.status(404);
    res.set({
      'Content-Type': 'text/plain',
    });
    res.send('not found');
  } else {
    // Render a single file.
    logger.debug(`Rendering file "/${storeKey}", type ${typeof storeFile}`);
    res.status(200);
    res.set({
      'Content-Type': 'application/json',
    });
    res.send(storeFile);
  }
};

export { indexUrl };

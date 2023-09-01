import { Request, Response } from 'express';
import { store } from '../../lib/store';
import { logger } from '../../lib/utils/logger';
import { dataDirManager } from '../../lib/store/dataDir';

// Url format /index/uuid/fr/4c7a791d-f994-4a0a-81c5-b0cdf759f8b5
const indexUUID = (req: Request, res: Response): void => {
  dataDirManager.update();
  const storeKey = req.params[0].split('/');

  const storeFile = storeKey[1]
    ? store.index.uuid.get(storeKey[0])?.get(storeKey[1])
    : undefined;
  if (storeFile === undefined) {
    res.status(404);
    res.set({
      'Content-Type': 'text/plain',
    });
    res.send('not found');
  } else {
    // Render a single file.
    logger.debug(`Rendering file "${req.params[0]}", type ${typeof storeFile}`);
    res.status(200);
    res.set({
      'Content-Type': 'application/json',
    });
    res.send(storeFile);
  }
};

export { indexUUID };

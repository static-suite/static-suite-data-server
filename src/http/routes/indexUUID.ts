import { Request, Response } from 'express';
import { store } from '../../lib/store';
import { logger } from '../../lib/utils/logger';
import { dataDirManager } from '../../lib/store/dataDir';

// Url format /index/uuid/fr/4c7a791d-f994-4a0a-81c5-b0cdf759f8b5
const indexUUID = (req: Request, res: Response): void => {
  dataDirManager.update();
  const storeKey = req.params[0].split('/');
  try {
    const storeFile = store.index.uuid.get(storeKey[0]).get(storeKey[1]);
    // Render a single file.
    logger.debug(
      `Rendering file "${storeKey.join('/')}", type ${typeof storeFile}`,
    );
    res.status(200);
    res.set({
      'Content-Type': 'text/plain',
    });
    res.send(storeFile);
  } catch (e) {
    res.status(404);
    res.set({
      'Content-Type': 'text/plain',
    });
    res.send('not found');
  }
};

export { indexUUID };

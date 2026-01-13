import { Request, Response } from 'express';
import { store } from '../../lib/store';
import { logger } from '../../lib/utils/logger';
import { dataDirManager } from '../../lib/store/dataDir';

// Url format /index/uuid/fr/4c7a791d-f994-4a0a-81c5-b0cdf759f8b5
const indexUUID = (req: Request, res: Response): void => {
  dataDirManager.update();
  const { langcode, uuid } = req.params;

  const storeFile = uuid
    ? store.index.uuid.get(String(langcode))?.get(String(uuid))
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

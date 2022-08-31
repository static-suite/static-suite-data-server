import path from 'path';
import { Request, Response } from 'express';
import mime from 'mime-types';
import { store } from '@lib/store';
import { logger } from '@lib/utils/logger';
import { dataDirManager } from '@lib/store/dataDir';

const data = (req: Request, res: Response): void => {
  dataDirManager.update();
  const storeKey = req.params[0];
  const storeKeyParts =
    !storeKey || storeKey === '' ? null : storeKey.split('/');

  const storeFile = store.data.get(storeKey);

  if (storeFile === undefined) {
    // Render a directory
    let dirKey = '';
    if (storeKey) {
      dirKey = storeKey.endsWith('/') ? storeKey : `${storeKey}/`;
    }
    logger.debug(`Rendering directory "${dirKey}"`);
    const storeDirSubset = store.data.subset({
      dir: dirKey,
      variant: undefined,
      ext: undefined,
      recursive: false,
    });

    // Obtain breadcrumbs.
    const breadcrumbs = storeKeyParts
      ? storeKeyParts.map((keyPart, index) => ({
          title: keyPart,
          url: storeKeyParts.slice(0, index + 1).join('/'),
        }))
      : [];

    type Item = {
      name: string;
      type: string;
      info?: any;
    };
    const items: Array<Item> = [];

    // Find directories, so they appear first on screen.
    const mapKeys = Array.from(store.data.keys());
    const foundDirs: Map<string, boolean> = new Map();
    const pattern = `^${dirKey}([^/]+)/.+$`;
    const regex = new RegExp(pattern);
    mapKeys.forEach(k => {
      const result = k.match(regex);
      const dir = result?.[1];
      if (dir && !foundDirs.has(dir)) {
        foundDirs.set(dir, true);
        items.push({
          name: result[1],
          type: 'directory',
        });
      }
    });

    // Add files so they appear after directories.
    let hasContentInfo = false;
    let info = null;
    storeDirSubset.items.forEach((item, key) => {
      const filename = storeDirSubset.filenames[key];
      info = {
        filename,
      };

      hasContentInfo = true;
      const content = item.data?.content;
      if (content) {
        const { id, type, bundle, isPublished, title } = content;
        if (id || type || bundle || title) {
          info = {
            id,
            type,
            bundle,
            isPublished,
            title,
            filename,
          };
          hasContentInfo = true;
        }
      }

      items.push({
        name: path.basename(filename),
        type: Array.isArray(item) ? 'array' : typeof item,
        info,
      });
    });
    const vars = {
      base: dirKey,
      path: dirKey || '/',
      breadcrumbs,
      items,
      count: items.length,
      hasContentInfo,
    };
    res.render('data', vars);
  } else {
    // Render a single file.
    logger.debug(`Rendering file "${storeKey}", type ${typeof storeFile}`);
    res.status(200);
    res.set({
      'Content-Type': mime.lookup(storeKey) || 'text/plain',
    });
    res.send(storeFile);
  }
};

export { data };

import path from 'path';
import { config } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir/dataDirManager';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { moduleHandler } from '@lib/utils/module';
import { watch } from '@lib/utils/fs';

/**
 * Initializes a watcher on any file inside queryDir and hookDir.
 *
 * @remarks
 * If queryDir and/or hookDir are defined by current configuration, a watcher
 * is initialized on them. When something changes inside those directories:
 * 1) Any query module and the query cache are deleted
 * 2) Any hook module is deleted and the store reloaded
 */
export const initWatcher = (): void => {
  const paths: string[] = [];
  if (config.queryDir) {
    paths.push(config.queryDir);
  }
  if (config.hookDir) {
    paths.push(path.dirname(config.hookDir));
  }

  const listener = (filePath: string) => {
    paths.forEach(p => moduleHandler.removeAll(new RegExp(`^${p}`)));
    if (config.hookDir && filePath.startsWith(config.hookDir)) {
      // When a hook changes, reload the whole data dir so hooks can be reapplied.
      dataDirManager.load({ incremental: true });
      logger.debug(`Re-building store done`);
    } else {
      // When a query changes, clear the query cache.
      cache.reset('query');
      logger.debug(`Query cache cleared`);
    }
  };

  watch(paths, {
    add: listener,
    change: listener,
    unlink: listener,
  });
};

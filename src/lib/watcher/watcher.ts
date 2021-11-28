import { config } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir/dataDirManager';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { watch } from '@lib/utils/fs';
import { hookManager } from '@lib/store/hook';
import { queryManager } from '@lib/query';

/**
 * Initializes a watcher on any file inside queryDir and hookDir.
 *
 * @remarks
 * If runMode is DEV and queryDir and/or hookDir are defined by current
 * configuration, a watcher is initialized on them.
 *
 * When something changes inside query directory:
 * 1) Remove all modules inside the query directory, so they are required again.
 * 2) Clear the query cache.
 *
 * When something changes inside hook directory:
 * 1) Remove all modules inside the hook directory, so they are required again.
 * 2) Reload the whole data directory so hooks can be reapplied.
 * 3) Clear the query cache.
 */
export const initWatcher = (): void => {
  const paths: string[] = [];
  if (config.queryDir) {
    paths.push(config.queryDir);
  }
  if (config.hookDir) {
    paths.push(config.hookDir);
  }

  const listener = (filePath: string) => {
    // Remove all modules inside the query directory.
    if (config.queryDir && filePath.startsWith(config.queryDir)) {
      queryManager.reset();
    }

    // Remove all modules inside the hook directory and reload the whole
    // data directory so hooks can be reapplied.
    if (config.hookDir && filePath.startsWith(config.hookDir)) {
      hookManager.reset();
      dataDirManager.load({ incremental: true });
      logger.debug(`Re-building store done`);
    }

    // In both cases, clear the query cache, which is now stale.
    cache.bin('query').clear();
    logger.debug(`Query cache cleared`);
  };

  watch(paths, {
    add: listener,
    change: listener,
    unlink: listener,
  });
};

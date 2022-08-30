import { config } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir/dataDirManager';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { watch } from '@lib/utils/fs';
import { hookManager } from '@lib/store/hook';
import { queryManager } from '@lib/query';
import { taskManager } from '@lib/task';

/**
 * Initializes a watcher on any file inside queryDir, hookDir and taskDir.
 *
 * @remarks
 * If runMode is DEV and queryDir, hookDir and/or taskDir are defined by current
 * configuration, a watcher is initialized on them.
 *
 * When something changes inside query directory:
 * 1) Remove all modules inside the query directory, so they are required again.
 * 2) Clear the query cache, since that is not done by the queryManager.
 *
 * When something changes inside hook directory:
 * 1) Remove all modules inside the hook directory, so they are required again.
 * 2) Reload the whole data directory so hooks can be reapplied (this implies clearing the query cache).
 */
export const initWatcher = (): void => {
  const paths: string[] = [];
  if (config.queryDir) {
    paths.push(config.queryDir);
  }
  if (config.hookDir) {
    paths.push(config.hookDir);
  }
  if (config.taskDir) {
    paths.push(config.taskDir);
  }

  const listener = (filePath: string) => {
    // Remove all modules inside the query directory.
    if (config.queryDir && filePath.startsWith(config.queryDir)) {
      queryManager.reset();
      // Clear all queries, since they are stale.
      // No need to clear the store subset cache, since no
      // file has been added/updated/deleted.
      cache.bin('query').clear();
    }

    // Remove all modules inside the hook directory and reload the whole
    // data directory so hooks can be reapplied.
    if (config.hookDir && filePath.startsWith(config.hookDir)) {
      hookManager.reset();
      dataDirManager.load({ incremental: true });
      logger.debug('Re-building store done');
    }

    // Remove all modules inside the task directory.
    if (config.taskDir && filePath.startsWith(config.taskDir)) {
      taskManager.reset();
    }
  };

  watch(paths, {
    add: listener,
    change: listener,
    unlink: listener,
  });
};

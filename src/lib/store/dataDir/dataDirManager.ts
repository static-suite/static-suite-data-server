import microtime from 'microtime';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { findFilesInDir } from '@lib/utils/fs';
import { logger } from '@lib/utils/logger';
import { workDirHelper } from '@lib/store/workDir';
import { cache } from '@lib/utils/cache';
import { storeManager } from '@lib/store/storeManager';
import { hookManager } from '@lib/store/hook';
import { queryManager } from '@lib/query';
import { taskManager } from '@lib/task';
import { DataDirManager } from './dataDir.types';
import { ChangedFiles } from '../workDir/workDir.types';
import { dependencyManager } from '../dependency/dependencyManager';

export const dataDirManager: DataDirManager = {
  load: () => {
    logger.info('Loading data dir...');
    const startDate = Date.now();

    // Reset store, just in case this load is called on an already loaded store.
    storeManager.reset();

    // Clear all caches.
    cache.clear();

    // Reset all managers.
    hookManager.reset();
    queryManager.reset();
    taskManager.reset();

    // Invoke "store load start" hook.
    hookManager.invokeOnStoreLoadStart();

    store.syncDate = dataDirManager.getModificationDate();

    // Add all files, one by one.
    const relativeFilePaths = findFilesInDir(config.dataDir);
    const storeHydrationStartDate = Date.now();
    relativeFilePaths.forEach(relativeFilePath => {
      storeManager.add(relativeFilePath);
    });

    logger.debug(
      `Store map hydrated in ${Date.now() - storeHydrationStartDate}ms.`,
    );

    const includeParserStartDate = Date.now();
    storeManager.parseIncludes();
    logger.debug(
      `Store include parser done in ${Date.now() - includeParserStartDate}ms.`,
    );

    // Invoke "store load done" hook.
    hookManager.invokeOnStoreLoadDone();

    logger.info(
      `${relativeFilePaths.length} files loaded in ${
        Date.now() - startDate
      }ms.`,
    );
  },

  update: () => {
    const dataDirModificationDate = dataDirManager.getModificationDate();

    let changedFiles: ChangedFiles = {
      updated: [],
      deleted: [],
    };

    if (store.syncDate) {
      if (dataDirModificationDate > store.syncDate) {
        // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
        // processes updating the data directory at the same time.
        const storeLastSyncDate = store.syncDate;
        store.syncDate = dataDirModificationDate;
        const startDate = microtime.now();
        logger.debug(
          `Data dir outdated. Current data loaded at ${storeLastSyncDate.toISOString()} but last updated at ${dataDirModificationDate.toISOString()}`,
        );

        // Before updating anything, track down which filepaths are invalidated with
        // the current set of dependencies, before those dependencies change.
        dependencyManager.trackInvalidatedFilepaths();

        changedFiles = workDirHelper.getChangedFilesSince(storeLastSyncDate);
        hookManager.invokeOnStoreChangeStart(changedFiles);
        changedFiles.updated.forEach(file => {
          storeManager.update(file);
          const fileContent = store.data.get(file);
          storeManager.parseSingleFileIncludes(file, fileContent);
        });
        changedFiles.deleted.forEach(file => {
          storeManager.remove(file);
        });
        // Clear all store subsets and queries, since they are stale.
        // In fact, the subset cache should be cleared only when files
        // are added or deleted, but not when they are simply updated.
        // Anyway, we currently do not have any means of distinguishing
        // added files from updated ones, so we must clear the subset
        // cache in all situations.
        cache.bin('store-subset').clear();
        cache.bin('query').clear();
        hookManager.invokeOnStoreChangeDone(changedFiles);
        const execTimeMs = (microtime.now() - startDate) / 1000;
        logger.debug(`Data dir updated in ${execTimeMs}ms.`);
      } else {
        logger.debug(
          `Data dir up to date. Current data loaded at ${store.syncDate.toISOString()} and last updated at ${dataDirModificationDate.toISOString()}`,
        );
      }
    } else {
      logger.debug(`Data dir not yet loaded, so it cannot be updated.`);
    }
    return changedFiles;
  },

  getModificationDate: (): Date =>
    workDirHelper.getModificationDate() || store.syncDate || new Date(0),
};

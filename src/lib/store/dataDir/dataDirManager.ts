import microtime from 'microtime';
import { config } from '../../config';
import { store } from '../store';
import { findFilesInDir } from '../../utils/fs';
import { logger } from '../../utils/logger';
import { unixEpochUniqueId, workDirHelper } from '../workDir';
import { cache } from '../../utils/cache';
import { storeManager } from '../storeManager';
import { hookManager } from '../hook';
import { queryManager } from '../../query';
import { taskManager } from '../../task';
import { DataDirManager } from './dataDir.types';
import { ChangedFiles } from '../workDir/workDir.types';
import { dependencyManager } from '../dependency/dependencyManager';

let initialUniqueIdAlreadySet = false;

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
    dependencyManager.reset();

    // Invoke "store load start" hook.
    hookManager.invokeOnStoreLoadStart();

    const modificationUniqueId = dataDirManager.getModificationUniqueId();
    if (!initialUniqueIdAlreadySet) {
      store.initialUniqueId = modificationUniqueId;
      initialUniqueIdAlreadySet = true;
    }
    store.currentUniqueId = modificationUniqueId;
    logger.info(`Found unique id: ${store.currentUniqueId}`);

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
    const dataDirModificationUniqueId =
      dataDirManager.getModificationUniqueId();

    let changedFiles: ChangedFiles = {
      updated: [],
      deleted: [],
      fromUniqueId: store.currentUniqueId,
      toUniqueId: dataDirModificationUniqueId,
    };

    if (store.currentUniqueId) {
      if (dataDirModificationUniqueId > store.currentUniqueId) {
        // Save store.syncDate to a variable and set it ASAP.
        const storeLastUniqueId = store.currentUniqueId;
        store.currentUniqueId = dataDirModificationUniqueId;
        const startDate = microtime.now();
        logger.debug(
          `Data dir outdated. Current unique id in memory is ${storeLastUniqueId} but data dir is ${dataDirModificationUniqueId}`,
        );

        // Before updating anything, track down which filepaths are invalidated with
        // the current set of dependencies, before those dependencies change.
        dependencyManager.trackInvalidatedFilepaths();

        changedFiles = workDirHelper.getChangedFilesBetween(
          storeLastUniqueId,
          dataDirModificationUniqueId,
        );
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
          `Data dir up to date. Current unique id in memory is ${store.currentUniqueId} and data dir is ${dataDirModificationUniqueId}`,
        );
      }
    } else {
      logger.debug(`Data dir not yet loaded, so it cannot be updated.`);
    }
    return changedFiles;
  },

  getModificationUniqueId: (): string =>
    workDirHelper.getModificationUniqueId() ||
    store.currentUniqueId ||
    unixEpochUniqueId,
};

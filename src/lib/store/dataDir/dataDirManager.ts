import microtime from 'microtime';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { findFilesInDir } from '@lib/utils/fs';
import { logger } from '@lib/utils/logger';
import { workDirHelper } from '@lib/store/workDir';
import { cache } from '@lib/utils/cache';
import { DataDirManager } from './dataDir.types';
import { storeManager } from '../storeManager';
import { hookManager } from '../hook';

export const dataDirManager: DataDirManager = {
  load: (options = { incremental: false }) => {
    logger.info('Loading data dir...');
    const startDate = Date.now();

    // Reset custom indexes if a load is called on an already loaded store.
    store.index.custom = new Map<string, any>();

    // Invoke "store load start" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreLoadStart) {
        hookModule.onStoreLoadStart({
          dataDir: config.dataDir,
          store,
        });
      }
    });

    const dataDirModificationDate = dataDirManager.getModificationDate();
    // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
    // processes loading the data directory at the same time.
    const storeLastSyncDate = store.syncDate;
    store.syncDate = dataDirModificationDate;
    const relativeFilePaths = findFilesInDir(config.dataDir);

    let updatedFiles: string[] = [];
    // Look for updated files since last update
    if (options.incremental) {
      if (storeLastSyncDate) {
        // No need to support deleted files, since we have all files
        // inside the dataDir (and deleted ones are already gone).
        ({ updated: updatedFiles } =
          workDirHelper.getChangedFilesSince(storeLastSyncDate));

        updatedFiles.forEach(file => {
          logger.info(`Loading updated file "${file}"`);
        });
      }
    } else {
      // Clear all file cache so new cache data doesn't contain any stale data or file.
      cache.bin('file').clear();
    }

    // Add all files, one by one, taking cache option into account.
    const updatedFilesContainsData = updatedFiles.length > 0;
    const storeHydrationStartDate = Date.now();
    relativeFilePaths.forEach(relativeFilePath => {
      let readFileFromCache = false;
      if (options.incremental) {
        readFileFromCache = true;
        if (
          updatedFilesContainsData &&
          updatedFiles.includes(relativeFilePath)
        ) {
          readFileFromCache = false;
        }
      }
      storeManager.add(relativeFilePath, { readFileFromCache });
    });

    logger.debug(
      `Store map hydrated in ${Date.now() - storeHydrationStartDate}ms.`,
    );

    const includeParserStartDate = Date.now();
    storeManager.parseIncludes();
    logger.debug(
      `Store include parser done in ${Date.now() - includeParserStartDate}ms.`,
    );

    // Clear all queries, since they are stale.
    // No need to clear the store subset cache, since no
    // file has been added/updated/deleted.
    cache.bin('query').clear();

    // Invoke "store load done" hook.
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreLoadDone) {
        hookModule.onStoreLoadDone({
          dataDir: config.dataDir,
          store,
        });
      }
    });

    logger.info(
      `${relativeFilePaths.length} files loaded in ${
        Date.now() - startDate
      }ms.`,
    );
  },

  update: () => {
    const dataDirModificationDate = dataDirManager.getModificationDate();
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
        const changedFiles =
          workDirHelper.getChangedFilesSince(storeLastSyncDate);
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
  },

  getModificationDate: (): Date =>
    workDirHelper.getModificationDate() || store.syncDate || new Date(0),
};

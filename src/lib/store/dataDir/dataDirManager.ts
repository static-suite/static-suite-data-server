import { config } from '@lib/config';
import { store } from '@lib/store';
import { findFilesInDir } from '@lib/utils/fs';
import { logger } from '@lib/utils/logger';
import { workDirHelper } from '@lib/store/workDir';
import { cache } from '@lib/utils/cache';
import { DataDirManager } from './dataDir.types';

export const dataDirManager: DataDirManager = {
  load: (options = { incremental: false }) => {
    logger.info('Loading data dir...');
    const dataDirModificationDate = dataDirManager.getModificationDate();
    // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
    // processes loading the data directory at the same time.
    const storeLastSyncDate = store.syncDate;
    store.syncDate = dataDirModificationDate;
    const files = findFilesInDir(config.dataDir);
    const startDate = Date.now();

    let updatedFiles: string[] = [];
    // Look for updated files since last update
    if (options.incremental) {
      if (storeLastSyncDate) {
        // No need to support deleted files, since we have all files
        // inside the dataDir (and deleted ones are already gone) and
        // we are using store's stage, which avoids mixing data from current
        // store with data from this operation.
        ({ updated: updatedFiles } =
          workDirHelper.getChangedFilesSince(storeLastSyncDate));

        updatedFiles.forEach(file => {
          logger.info(`Loading updated file "${file}"`);
        });
      }
    }

    // Clear all file cache so new cache data doesn't contain any stale data or file.
    if (!options.incremental) {
      cache.reset('file');
    }

    // Add all files, one by one, taking cache option into account.
    const updatedFilesIsEmpty = updatedFiles.length === 0;
    files.forEach(file => {
      store.add(config.dataDir, file, {
        useStage: true,
        useCache: !updatedFilesIsEmpty && !updatedFiles.includes(file),
      });
    });

    store.promoteStage();
    cache.reset('query');

    const endDate = Date.now();
    logger.info(`${files.length} files loaded in ${endDate - startDate}ms.`);
  },

  update: () => {
    const dataDirModificationDate = dataDirManager.getModificationDate();
    if (store.syncDate) {
      if (dataDirModificationDate > store.syncDate) {
        // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
        // processes updating the data directory at the same time.
        const storeLastSyncDate = store.syncDate;
        store.syncDate = dataDirModificationDate;
        logger.debug(
          `Data dir outdated. Current data loaded at ${storeLastSyncDate.toISOString()} but last updated at ${dataDirModificationDate.toISOString()}`,
        );
        const changedFiles =
          workDirHelper.getChangedFilesSince(storeLastSyncDate);
        changedFiles.updated.forEach(file =>
          store.update(config.dataDir, file),
        );
        changedFiles.deleted.forEach(file => store.remove(file));
        cache.reset('query');
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

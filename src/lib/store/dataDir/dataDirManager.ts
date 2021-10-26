import { config } from '@lib/config';
import { store } from '@lib/store';
import { findFilesInDir } from '@lib/utils/fs';
import { logger } from '@lib/utils/logger';
import { workDirHelper } from '@lib/store/workDir';
import { cache } from '@lib/utils/cache';
import { DataDirManager } from './dataDir.types';

/**
 * DataDirManager
 */
export const dataDirManager: DataDirManager = {
  /**
   * The data store
   */
  store,

  /**
   * Load all files inside a directory into the store.
   *
   * By default, it loads all files from disc and read their contents, unless
   * options.useCache is set to true. In such case, we ask the metadata helper
   * for updated files, and read data from disc only for those updated files.
   *
   * The only drawback of this approach is that data can be updated without
   * informing the metadata system (exporting data from Drupal using a batch process).
   * For such cases, Data Server should be completely restarted, or this function
   * should be called with `options.useCache = false`
   *
   * @param options - Configuration options
   *
   */
  loadDataDir: (options = { useCache: false }) => {
    logger.info('Loading data dir...');
    const files = findFilesInDir(config.dataDir);
    const startDate = Date.now();

    let updatedFiles: string[] = [];
    // Look for updated files since last update
    if (options.useCache) {
      if (store.updated) {
        ({ updated: updatedFiles } = workDirHelper.getChangedFilesSince(
          store.updated,
        ));
      }

      if (updatedFiles.length > 0) {
        updatedFiles.forEach(file => {
          logger.info(`Loading updated file "${file}"`);
        });
      }
    }

    // Clear all file cache so new cache data doesn't contain any stale data or file.
    if (!options.useCache) {
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

    store.updated = new Date();
    store.promoteStage();
    cache.reset('query');

    const endDate = Date.now();
    logger.info(`${files.length} files loaded in ${endDate - startDate}ms.`);
  },

  /**
   * Update the store with the files that have changed since last update.
   *
   * It's main difference with loadDataDir() is that, instead of loading the whole store,
   * updateDataDir() checks if something has changed, not doing anything if nothing
   * has changed. Thus, this method is way faster than loadDataDir().
   *
   * @returns The store manager.
   */
  updateDataDir: () => {
    // Get when was data dir last updated.
    const dataDirLastUpdate = dataDirManager.getDataDirLastUpdate();
    if (dataDirLastUpdate && store.updated) {
      if (dataDirLastUpdate > store.updated) {
        // Save store.updated to a variable and set the new value from dataDirLastUpdate ASAP.
        const storeLastUpdate = store.updated;
        store.updated = dataDirLastUpdate;
        logger.debug(
          `Data dir outdated. Current data loaded at ${storeLastUpdate?.toISOString()} but last updated at ${dataDirLastUpdate.toISOString()}`,
        );
        const changedFiles =
          workDirHelper.getChangedFilesSince(storeLastUpdate);
        changedFiles.updated.forEach(file =>
          store.update(config.dataDir, file),
        );
        changedFiles.deleted.forEach(file => store.remove(file));
        cache.reset('query');
      } else {
        logger.debug(
          `Data dir up to date. Current data loaded at ${store.updated?.toISOString()} and last updated at ${dataDirLastUpdate.toISOString()}`,
        );
      }
    }
  },

  /**
   * Get date of last update of metadata dir (work dir).
   *
   * @returns The date of last update of metadata dir (work dir).
   */
  getDataDirLastUpdate: (): Date | null =>
    workDirHelper.getLastUpdate() || store.updated,
};

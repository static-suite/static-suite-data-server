import { config } from '../config';
import { Store, store } from './store';
import { findFilesInDir } from '../utils/fsUtils';
import { logger } from '../utils/logger';
import { metadataHelper } from './metadataHelper';
import { cache } from '../utils/cache';

type DataDirManager = {
  store: Store;
  loadDataDir(options?: { useCache: boolean }): DataDirManager;
  updateDataDir(): DataDirManager;
  getDataDirLastUpdate(): Date | null;
};

/**
 * @typedef {Object} DataDirManager
 * @property {Object} store - Object that holds all data.
 * @property {Function} loadDataDir - Load all files inside a directory into the store.
 * @property {Function} updateDataDir - Load all files inside a directory into the store.
 * @property {Function} getDataDirLastUpdate - Get date of last update of metadata dir (work dir).
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
   * @param {Object} options Configuration options
   * @param {boolean} options.useCache - Use cached data to avoid reloading files.
   *
   * @return {StoreManager} - The store manager.
   */
  loadDataDir: (options = { useCache: false }): DataDirManager => {
    logger.info('Loading data dir...');
    const files = findFilesInDir(config.dataDir);
    const startDate = Date.now();

    let updatedFiles: string[] = [];
    // Look for updated files since last update
    if (options.useCache) {
      if (store.updated) {
        ({ updated: updatedFiles } = metadataHelper.getChangedFilesSince(
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

    return dataDirManager;
  },

  /**
   * Update the store with the files that have changed since last update.
   *
   * It's main difference with loadDataDir() is that, instead of loading the whole store,
   * updateDataDir() checks if something has changed, not doing anything if nothing
   * has changed. Thus, this method is way faster than loadDataDir().
   *
   * @return {StoreManager} - The store manager.
   */
  updateDataDir: (): DataDirManager => {
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
        const changedFiles = metadataHelper.getChangedFilesSince(
          storeLastUpdate,
        );
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

    return dataDirManager;
  },

  /**
   * Get date of last update of metadata dir (work dir).
   *
   * @return number
   *   The date of last update of metadata dir (work dir).
   */
  getDataDirLastUpdate: (): Date | null =>
    metadataHelper.getLastUpdate() || store.updated,
};

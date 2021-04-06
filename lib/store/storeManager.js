const { config } = require('../config');
const { store } = require('./store');
const { findFilesInDir } = require('../utils/fsUtils');
const { logger } = require('../utils/logger');
const { metadataHelper } = require('./metadataHelper');
const { cache } = require('../utils/cache');

/**
 * @typedef {Object} StoreManager
 * @property {Object} store - Object that holds all data.
 * @property {Function} loadDataDir - Load all files inside a directory into the store.
 * @property {Function} updateDataDir - Load all files inside a directory into the store.
 */
const storeManager = {
  /**
   * The data store
   */
  store,

  /**
   * Load all files inside a directory into the store.
   *
   * @returns {StoreManager} - The store manager.
   */
  loadDataDir: () => {
    const files = findFilesInDir(config.dataDir);
    const startDate = Date.now();

    let updatedFiles = [];
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

    files.forEach(file => {
      store.add(config.dataDir, file, {
        useStage: true,
        useCache: !updatedFiles.includes(file),
      });
    });
    store.updated = new Date();
    store.promoteStage();
    cache.reset('query');
    const endDate = Date.now();
    logger.info(`${files.length} files loaded in ${endDate - startDate}ms.`);
    return storeManager;
  },

  /**
   * Update the store with the files that have changed since last update.
   *
   * @returns {StoreManager} - The store manager.
   */
  updateDataDir: () => {
    // Get when was data dir last updated.
    const dataDirLastUpdate = storeManager.getDataDirLastUpdate();
    if (dataDirLastUpdate > store.updated) {
      // Save store.updated to a variable and set the new value from dataDirLastUpdate ASAP.
      const storeLastUpdate = store.updated;
      store.updated = dataDirLastUpdate;
      logger.debug(
        `Data dir outdated. Current data loaded at ${storeLastUpdate?.toISOString()} but last updated at ${dataDirLastUpdate.toISOString()}`,
      );
      const changedFiles = metadataHelper.getChangedFilesSince(storeLastUpdate);
      changedFiles.updated.forEach(file => store.update(config.dataDir, file));
      changedFiles.deleted.forEach(file => store.remove(config.dataDir, file));
      cache.reset('query');
    } else {
      logger.debug(
        `Data dir up to date. Current data loaded at ${store.updated?.toISOString()} and last updated at ${dataDirLastUpdate.toISOString()}`,
      );
    }

    return storeManager;
  },

  /**
   * Get date of last update of metadata dir (work dir).
   *
   * @return number
   *   The date of last update of metadata dir (work dir).
   */
  getDataDirLastUpdate: () => metadataHelper.getLastUpdate() || store.updated,
};

module.exports.storeManager = storeManager;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataDirManager = void 0;
const config_1 = require("../config");
const store_1 = require("./store");
const fsUtils_1 = require("../utils/fsUtils");
const logger_1 = require("../utils/logger");
const metadataHelper_1 = require("./metadataHelper");
const cache_1 = require("../utils/cache");
/**
 * @typedef {Object} DataDirManager
 * @property {Object} store - Object that holds all data.
 * @property {Function} loadDataDir - Load all files inside a directory into the store.
 * @property {Function} updateDataDir - Load all files inside a directory into the store.
 * @property {Function} getDataDirLastUpdate - Get date of last update of metadata dir (work dir).
 */
exports.dataDirManager = {
    /**
     * The data store
     */
    store: store_1.store,
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
    loadDataDir: (options = { useCache: false }) => {
        logger_1.logger.info('Loading data dir...');
        const files = (0, fsUtils_1.findFilesInDir)(config_1.config.dataDir);
        const startDate = Date.now();
        let updatedFiles = [];
        // Look for updated files since last update
        if (options.useCache) {
            if (store_1.store.updated) {
                ({ updated: updatedFiles } = metadataHelper_1.metadataHelper.getChangedFilesSince(store_1.store.updated));
            }
            if (updatedFiles.length > 0) {
                updatedFiles.forEach(file => {
                    logger_1.logger.info(`Loading updated file "${file}"`);
                });
            }
        }
        // Clear all file cache so new cache data doesn't contain any stale data or file.
        if (!options.useCache) {
            cache_1.cache.reset('file');
        }
        // Add all files, one by one, taking cache option into account.
        const updatedFilesIsEmpty = updatedFiles.length === 0;
        files.forEach(file => {
            store_1.store.add(config_1.config.dataDir, file, {
                useStage: true,
                useCache: !updatedFilesIsEmpty && !updatedFiles.includes(file),
            });
        });
        store_1.store.updated = new Date();
        store_1.store.promoteStage();
        cache_1.cache.reset('query');
        const endDate = Date.now();
        logger_1.logger.info(`${files.length} files loaded in ${endDate - startDate}ms.`);
        return exports.dataDirManager;
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
    updateDataDir: () => {
        // Get when was data dir last updated.
        const dataDirLastUpdate = exports.dataDirManager.getDataDirLastUpdate();
        if (dataDirLastUpdate && store_1.store.updated) {
            if (dataDirLastUpdate > store_1.store.updated) {
                // Save store.updated to a variable and set the new value from dataDirLastUpdate ASAP.
                const storeLastUpdate = store_1.store.updated;
                store_1.store.updated = dataDirLastUpdate;
                logger_1.logger.debug(`Data dir outdated. Current data loaded at ${storeLastUpdate?.toISOString()} but last updated at ${dataDirLastUpdate.toISOString()}`);
                const changedFiles = metadataHelper_1.metadataHelper.getChangedFilesSince(storeLastUpdate);
                changedFiles.updated.forEach(file => store_1.store.update(config_1.config.dataDir, file));
                changedFiles.deleted.forEach(file => store_1.store.remove(file));
                cache_1.cache.reset('query');
            }
            else {
                logger_1.logger.debug(`Data dir up to date. Current data loaded at ${store_1.store.updated?.toISOString()} and last updated at ${dataDirLastUpdate.toISOString()}`);
            }
        }
        return exports.dataDirManager;
    },
    /**
     * Get date of last update of metadata dir (work dir).
     *
     * @return number
     *   The date of last update of metadata dir (work dir).
     */
    getDataDirLastUpdate: () => metadataHelper_1.metadataHelper.getLastUpdate() || store_1.store.updated,
};

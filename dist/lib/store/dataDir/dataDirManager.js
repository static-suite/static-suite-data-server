"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataDirManager = void 0;
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const fs_1 = require("@lib/utils/fs");
const logger_1 = require("@lib/utils/logger");
const workDir_1 = require("@lib/store/workDir");
const cache_1 = require("@lib/utils/cache");
const storeManager_1 = require("../storeManager");
exports.dataDirManager = {
    load: (options = { incremental: false }) => {
        logger_1.logger.info('Loading data dir...');
        const dataDirModificationDate = exports.dataDirManager.getModificationDate();
        // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
        // processes loading the data directory at the same time.
        const storeLastSyncDate = store_1.store.syncDate;
        store_1.store.syncDate = dataDirModificationDate;
        const relativeFilePaths = (0, fs_1.findFilesInDir)(config_1.config.dataDir);
        const startDate = Date.now();
        let updatedFiles = [];
        // Look for updated files since last update
        if (options.incremental) {
            if (storeLastSyncDate) {
                // No need to support deleted files, since we have all files
                // inside the dataDir (and deleted ones are already gone).
                ({ updated: updatedFiles } =
                    workDir_1.workDirHelper.getChangedFilesSince(storeLastSyncDate));
                updatedFiles.forEach(file => {
                    logger_1.logger.info(`Loading updated file "${file}"`);
                });
            }
        }
        else {
            // Clear all file cache so new cache data doesn't contain any stale data or file.
            cache_1.cache.bin('file').clear();
        }
        // Add all files, one by one, taking cache option into account.
        const updatedFilesIsEmpty = updatedFiles.length === 0;
        relativeFilePaths.forEach(relativeFilePath => {
            storeManager_1.storeManager.add(relativeFilePath, {
                useCache: !updatedFilesIsEmpty && !updatedFiles.includes(relativeFilePath),
            });
        });
        storeManager_1.storeManager.includeParse();
        cache_1.cache.bin('query').clear();
        const endDate = Date.now();
        logger_1.logger.info(`${relativeFilePaths.length} files loaded in ${endDate - startDate}ms.`);
    },
    update: () => {
        const dataDirModificationDate = exports.dataDirManager.getModificationDate();
        if (store_1.store.syncDate) {
            if (dataDirModificationDate > store_1.store.syncDate) {
                // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
                // processes updating the data directory at the same time.
                const storeLastSyncDate = store_1.store.syncDate;
                store_1.store.syncDate = dataDirModificationDate;
                logger_1.logger.debug(`Data dir outdated. Current data loaded at ${storeLastSyncDate.toISOString()} but last updated at ${dataDirModificationDate.toISOString()}`);
                const changedFiles = workDir_1.workDirHelper.getChangedFilesSince(storeLastSyncDate);
                changedFiles.updated.forEach(file => {
                    storeManager_1.storeManager.update(file);
                    const fileContent = file
                        .split('/')
                        .reduce((prev, curr) => prev && prev[curr], store_1.store.data);
                    storeManager_1.storeManager.includeParseFile(fileContent);
                });
                changedFiles.deleted.forEach(file => storeManager_1.storeManager.remove(file));
                cache_1.cache.bin('query').clear();
            }
            else {
                logger_1.logger.debug(`Data dir up to date. Current data loaded at ${store_1.store.syncDate.toISOString()} and last updated at ${dataDirModificationDate.toISOString()}`);
            }
        }
        else {
            logger_1.logger.debug(`Data dir not yet loaded, so it cannot be updated.`);
        }
    },
    getModificationDate: () => workDir_1.workDirHelper.getModificationDate() || store_1.store.syncDate || new Date(0),
};

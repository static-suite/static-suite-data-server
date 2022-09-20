"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataDirManager = void 0;
const microtime_1 = __importDefault(require("microtime"));
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const fs_1 = require("@lib/utils/fs");
const logger_1 = require("@lib/utils/logger");
const workDir_1 = require("@lib/store/workDir");
const cache_1 = require("@lib/utils/cache");
const queryTagManager_1 = require("@lib/query/queryTagManager");
const storeManager_1 = require("../storeManager");
const hook_1 = require("../hook");
exports.dataDirManager = {
    load: (options = { incremental: false }) => {
        logger_1.logger.info('Loading data dir...');
        const startDate = Date.now();
        // Reset custom indexes if a load is called on an already loaded store.
        store_1.store.index.custom = new Map();
        // Invoke "store load start" hook.
        const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreLoadStart) {
                hookModule.onStoreLoadStart({
                    dataDir: config_1.config.dataDir,
                    store: store_1.store,
                    queryTagManager: queryTagManager_1.queryTagManager,
                });
            }
        });
        const dataDirModificationDate = exports.dataDirManager.getModificationDate();
        // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
        // processes loading the data directory at the same time.
        const storeLastSyncDate = store_1.store.syncDate;
        store_1.store.syncDate = dataDirModificationDate;
        const relativeFilePaths = (0, fs_1.findFilesInDir)(config_1.config.dataDir);
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
        const updatedFilesContainsData = updatedFiles.length > 0;
        const storeHydrationStartDate = Date.now();
        relativeFilePaths.forEach(relativeFilePath => {
            let readFileFromCache = false;
            if (options.incremental) {
                readFileFromCache = true;
                if (updatedFilesContainsData &&
                    updatedFiles.includes(relativeFilePath)) {
                    readFileFromCache = false;
                }
            }
            storeManager_1.storeManager.add(relativeFilePath, { readFileFromCache });
        });
        logger_1.logger.debug(`Store map hydrated in ${Date.now() - storeHydrationStartDate}ms.`);
        const includeParserStartDate = Date.now();
        storeManager_1.storeManager.parseIncludes();
        logger_1.logger.debug(`Store include parser done in ${Date.now() - includeParserStartDate}ms.`);
        // Clear all queries, since they are stale.
        // No need to clear the store subset cache, since no
        // file has been added/updated/deleted.
        cache_1.cache.bin('query').clear();
        // Invoke "store load done" hook.
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreLoadDone) {
                hookModule.onStoreLoadDone({
                    dataDir: config_1.config.dataDir,
                    store: store_1.store,
                    queryTagManager: queryTagManager_1.queryTagManager,
                });
            }
        });
        logger_1.logger.info(`${relativeFilePaths.length} files loaded in ${Date.now() - startDate}ms.`);
    },
    update: () => {
        const dataDirModificationDate = exports.dataDirManager.getModificationDate();
        if (store_1.store.syncDate) {
            if (dataDirModificationDate > store_1.store.syncDate) {
                // Save store.syncDate to a variable and set it ASAP to avoid two concurrent
                // processes updating the data directory at the same time.
                const storeLastSyncDate = store_1.store.syncDate;
                store_1.store.syncDate = dataDirModificationDate;
                const startDate = microtime_1.default.now();
                logger_1.logger.debug(`Data dir outdated. Current data loaded at ${storeLastSyncDate.toISOString()} but last updated at ${dataDirModificationDate.toISOString()}`);
                const changedFiles = workDir_1.workDirHelper.getChangedFilesSince(storeLastSyncDate);
                changedFiles.updated.forEach(file => {
                    storeManager_1.storeManager.update(file);
                    const fileContent = store_1.store.data.get(file);
                    storeManager_1.storeManager.parseSingleFileIncludes(file, fileContent);
                });
                changedFiles.deleted.forEach(file => {
                    storeManager_1.storeManager.remove(file);
                });
                // Clear all store subsets and queries, since they are stale.
                // In fact, the subset cache should be cleared only when files
                // are added or deleted, but not when they are simply updated.
                // Anyway, we currently do not have any means of distinguishing
                // added files from updated ones, so we must clear the subset
                // cache in all situations.
                cache_1.cache.bin('store-subset').clear();
                cache_1.cache.bin('query').clear();
                const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
                logger_1.logger.debug(`Data dir updated in ${execTimeMs}ms.`);
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

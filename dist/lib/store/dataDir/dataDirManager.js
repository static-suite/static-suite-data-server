"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataDirManager = void 0;
const microtime_1 = __importDefault(require("microtime"));
const config_1 = require("../../config");
const store_1 = require("../store");
const fs_1 = require("../../utils/fs");
const logger_1 = require("../../utils/logger");
const workDir_1 = require("../workDir");
const cache_1 = require("../../utils/cache");
const storeManager_1 = require("../storeManager");
const hook_1 = require("../hook");
const query_1 = require("../../query");
const task_1 = require("../../task");
const dependencyManager_1 = require("../dependency/dependencyManager");
let initialUniqueIdAlreadySet = false;
exports.dataDirManager = {
    load: () => {
        logger_1.logger.info('Loading data dir...');
        const startDate = Date.now();
        // Reset store, just in case this load is called on an already loaded store.
        storeManager_1.storeManager.reset();
        // Clear all caches.
        cache_1.cache.clear();
        // Reset all managers.
        hook_1.hookManager.reset();
        query_1.queryManager.reset();
        task_1.taskManager.reset();
        dependencyManager_1.dependencyManager.reset();
        // Invoke "store load start" hook.
        hook_1.hookManager.invokeOnStoreLoadStart();
        const modificationUniqueId = exports.dataDirManager.getModificationUniqueId();
        if (!initialUniqueIdAlreadySet) {
            store_1.store.initialUniqueId = modificationUniqueId;
            initialUniqueIdAlreadySet = true;
        }
        store_1.store.currentUniqueId = modificationUniqueId;
        logger_1.logger.info(`Found unique id: ${store_1.store.currentUniqueId}`);
        // Add all files, one by one.
        const relativeFilePaths = (0, fs_1.findFilesInDir)(config_1.config.dataDir);
        const storeHydrationStartDate = Date.now();
        relativeFilePaths.forEach(relativeFilePath => {
            storeManager_1.storeManager.add(relativeFilePath);
        });
        logger_1.logger.debug(`Store map hydrated in ${Date.now() - storeHydrationStartDate}ms.`);
        const includeParserStartDate = Date.now();
        storeManager_1.storeManager.parseIncludes();
        logger_1.logger.debug(`Store include parser done in ${Date.now() - includeParserStartDate}ms.`);
        // Invoke "store load done" hook.
        hook_1.hookManager.invokeOnStoreLoadDone();
        logger_1.logger.info(`${relativeFilePaths.length} files loaded in ${Date.now() - startDate}ms.`);
    },
    update: () => {
        const dataDirModificationUniqueId = exports.dataDirManager.getModificationUniqueId();
        let changedFiles = {
            updated: [],
            deleted: [],
            fromUniqueId: store_1.store.currentUniqueId,
            toUniqueId: dataDirModificationUniqueId,
        };
        if (store_1.store.currentUniqueId) {
            if (dataDirModificationUniqueId > store_1.store.currentUniqueId) {
                // Save store.syncDate to a variable and set it ASAP.
                const storeLastUniqueId = store_1.store.currentUniqueId;
                store_1.store.currentUniqueId = dataDirModificationUniqueId;
                const startDate = microtime_1.default.now();
                logger_1.logger.debug(`Data dir outdated. Current unique id in memory is ${storeLastUniqueId} but data dir is ${dataDirModificationUniqueId}`);
                // Before updating anything, track down which filepaths are invalidated with
                // the current set of dependencies, before those dependencies change.
                dependencyManager_1.dependencyManager.trackInvalidatedFilepaths();
                changedFiles = workDir_1.workDirHelper.getChangedFilesBetween(storeLastUniqueId, dataDirModificationUniqueId);
                hook_1.hookManager.invokeOnStoreChangeStart(changedFiles);
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
                hook_1.hookManager.invokeOnStoreChangeDone(changedFiles);
                const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
                logger_1.logger.debug(`Data dir updated in ${execTimeMs}ms.`);
            }
            else {
                logger_1.logger.debug(`Data dir up to date. Current unique id in memory is ${store_1.store.currentUniqueId} and data dir is ${dataDirModificationUniqueId}`);
            }
        }
        else {
            logger_1.logger.debug(`Data dir not yet loaded, so it cannot be updated.`);
        }
        return changedFiles;
    },
    getModificationUniqueId: () => workDir_1.workDirHelper.getModificationUniqueId() ||
        store_1.store.currentUniqueId ||
        workDir_1.unixEpochUniqueId,
};

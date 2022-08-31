"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeManager = exports.isHookWatcherEnabled = void 0;
const config_1 = require("@lib/config");
const fs_1 = require("@lib/utils/fs");
const cache_1 = require("@lib/utils/cache");
const hook_1 = require("./hook");
const _1 = require(".");
const include_1 = require("./include");
const dataServer_types_1 = require("../dataServer.types");
const tracker_1 = require("./diff/tracker");
const fileCache = cache_1.cache.bin('file');
/**
 * Tells whether a watcher for hooks is enabled.
 *
 * @remarks
 * Files from data dir are not read again once data dir is loaded
 * during bootstrap, except when:
 * 1) A file is updated: only that file is read form data dir.
 * 2) A watcher detects a hook change: all files in data dir are read again.
 *
 * For the second case, we want to avoid having to actually read all
 * files from disk if they have not changed. To do so, there is a
 * file cache that caches the file raw contents. That cache uses a lot of
 * memory, and should only be enabled when run mode is DEV (hence, a watcher
 * is enabled) and a hook directory is defined.
 *
 * @returns True if hook watcher is enabled.
 */
const isHookWatcherEnabled = () => config_1.config.runMode === dataServer_types_1.RunMode.DEV && !!config_1.config.hookDir;
exports.isHookWatcherEnabled = isHookWatcherEnabled;
/**
 * Sets a file into the store, regardless of being already added or not.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
 * @param options - Configuration options.
 *
 * @returns Object with two properties, "raw" and "json".
 */
const setFileIntoStore = (relativeFilepath, options = { readFileFromCache: false }) => {
    const hookWatcherEnabled = (0, exports.isHookWatcherEnabled)();
    const absoluteFilePath = `${config_1.config.dataDir}/${relativeFilepath}`;
    let fileContent = (0, fs_1.getFileContent)(absoluteFilePath, {
        readFileFromCache: options.readFileFromCache,
        isFileCacheEnabled: hookWatcherEnabled,
    });
    // Invoke "process file" hook.
    const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
        const hookModule = hookInfo.getModule();
        if (hookModule.onProcessFile) {
            fileContent = hookModule.onProcessFile({
                dataDir: config_1.config.dataDir,
                relativeFilepath,
                fileContent,
                store: _1.store,
            });
        }
    });
    const dataToStore = fileContent.json || fileContent.raw;
    if (fileContent.json) {
        // Check if the object already exists to make sure we don't break the reference
        const previousData = _1.store.data.get(relativeFilepath);
        if (dataToStore && typeof dataToStore === 'object') {
            if (previousData) {
                // Remove previous include data from includeIndex.
                include_1.includeIndex.remove(relativeFilepath, previousData);
                // Delete all referenced object properties
                Object.keys(previousData).forEach(key => {
                    delete previousData[key];
                });
                // hydrate new object properties into referenced object
                Object.keys(dataToStore).forEach(key => {
                    previousData[key] = dataToStore[key];
                });
            }
            const uuid = dataToStore.data?.content?.uuid;
            const langcode = dataToStore.data?.content?.langcode?.value;
            if (uuid && langcode) {
                const langcodeMap = _1.store.index.uuid.get(langcode) ||
                    _1.store.index.uuid.set(langcode, new Map()).get(langcode);
                langcodeMap.set(uuid, dataToStore);
            }
            const url = dataToStore.data?.content?.url?.path;
            if (url) {
                _1.store.index.url.set(url, dataToStore);
            }
            // Set include data in includeIndex.
            include_1.includeIndex.set(relativeFilepath, dataToStore);
        }
    }
    _1.store.data.set(relativeFilepath, dataToStore);
    return fileContent;
};
exports.storeManager = {
    add: (relativeFilepath, options = { readFileFromCache: false }) => {
        const fileContent = setFileIntoStore(relativeFilepath, options);
        // Invoke "store add" hook.
        const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreItemAdd) {
                hookModule.onStoreItemAdd({
                    dataDir: config_1.config.dataDir,
                    relativeFilepath,
                    fileContent,
                    store: _1.store,
                });
            }
        });
        return exports.storeManager;
    },
    remove: (relativeFilepath) => {
        // Track down file before it changes.
        tracker_1.tracker.trackChangedFile(relativeFilepath);
        if ((0, exports.isHookWatcherEnabled)()) {
            // Delete file contents from cache.
            fileCache.delete(`${config_1.config.dataDir}/${relativeFilepath}`);
        }
        // Delete file contents from store.
        const data = _1.store.data.get(relativeFilepath);
        const uuid = data.data?.content?.uuid;
        const langcode = data.data?.content?.langcode?.value;
        _1.store.index.url.get(langcode).delete(uuid);
        _1.store.data.delete(relativeFilepath);
        // Invoke "store remove" hook.
        const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreItemRemove) {
                hookModule.onStoreItemRemove({
                    dataDir: config_1.config.dataDir,
                    relativeFilepath,
                    store: _1.store,
                });
            }
        });
        // Track down file after it changes.
        // tracker.trackChangedFile(relativeFilepath);
        return exports.storeManager;
    },
    update: (relativeFilepath) => {
        // Track down file before it changes.
        tracker_1.tracker.trackChangedFile(relativeFilepath);
        const fileContent = setFileIntoStore(relativeFilepath, {
            readFileFromCache: false,
        });
        // Invoke "store update" hook.
        const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreItemUpdate) {
                hookModule.onStoreItemUpdate({
                    dataDir: config_1.config.dataDir,
                    relativeFilepath,
                    fileContent,
                    store: _1.store,
                });
            }
        });
        // Track down file after it changes.
        tracker_1.tracker.trackChangedFile(relativeFilepath);
        return exports.storeManager;
    },
    parseIncludes: () => {
        // Parses static includes.
        _1.store.data.forEach((fileContent, relativeFilepath) => {
            include_1.includeParser.static(relativeFilepath, fileContent);
        });
        // Parses dynamic includes.
        _1.store.data.forEach(fileContent => {
            include_1.includeParser.dynamic(fileContent);
        });
        return exports.storeManager;
    },
    parseSingleFileIncludes: (relativeFilepath, fileContent) => {
        include_1.includeParser.static(relativeFilepath, fileContent);
        include_1.includeParser.dynamic(fileContent);
        return exports.storeManager;
    },
};

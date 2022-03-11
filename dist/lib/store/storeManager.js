"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeManager = exports.isHookWatcherEnabled = void 0;
// import path from 'path';
const config_1 = require("@lib/config");
const fs_1 = require("@lib/utils/fs");
const cache_1 = require("@lib/utils/cache");
const hook_1 = require("./hook");
const _1 = require(".");
const includeParser_1 = require("./includeParser");
const dataServer_types_1 = require("../dataServer.types");
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
 * files from cache if they have not changed. To do so, there is a
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
    let fileContent = hookWatcherEnabled && options.readFileFromCache
        ? fileCache.get(relativeFilepath)
        : undefined;
    if (!fileContent) {
        const absoluteFilePath = `${config_1.config.dataDir}/${relativeFilepath}`;
        fileContent = (0, fs_1.getFileContent)(absoluteFilePath);
        if (hookWatcherEnabled) {
            fileCache.set(relativeFilepath, fileContent);
        }
    }
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
                    _1.store.index.uuid.set(langcode, new Map());
                langcodeMap.set(uuid, dataToStore);
            }
            const url = dataToStore.data?.content?.url?.path;
            if (url) {
                _1.store.index.url.set(url, dataToStore);
            }
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
        if ((0, exports.isHookWatcherEnabled)()) {
            // Delete file contents from cache.
            fileCache.delete(relativeFilepath);
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
        return exports.storeManager;
    },
    update: (relativeFilepath) => {
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
        return exports.storeManager;
    },
    parseIncludes: () => {
        // Parses static includes.
        _1.store.data.forEach(fileContent => {
            exports.storeManager.parseSingleFileIncludes(fileContent);
        });
        // Parses dynamic includes.
        _1.store.data.forEach(fileContent => {
            includeParser_1.includeParser.dynamic(fileContent);
        });
        return exports.storeManager;
    },
    parseSingleFileIncludes: (fileContent) => {
        includeParser_1.includeParser.static(fileContent);
        return exports.storeManager;
    },
    get: (relativeFilepath) => {
        let data = _1.store.data.get(relativeFilepath);
        if (!data) {
            const filecontent = (0, fs_1.getFileContent)(`${config_1.config.dataDir}/${relativeFilepath}`);
            data = filecontent.json || filecontent.raw;
        }
        return data;
    },
};

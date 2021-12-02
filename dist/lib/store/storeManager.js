"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeManager = void 0;
// import path from 'path';
const config_1 = require("@lib/config");
const fs_1 = require("@lib/utils/fs");
const cache_1 = require("@lib/utils/cache");
const hook_1 = require("./hook");
const _1 = require(".");
const includeParser_1 = require("./includeParser");
const fileCache = cache_1.cache.bin('file');
/**
 * Sets a file into the store, regardless of being already added or not.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
 * @param options - Configuration options.
 *
 * @returns Object with two properties, "raw" and "json".
 */
const setFileIntoStore = (relativeFilepath, options = { readFileFromCache: false }) => {
    let fileContent = options.readFileFromCache
        ? fileCache.get(relativeFilepath)
        : undefined;
    if (!fileContent) {
        const absoluteFilePath = `${config_1.config.dataDir}/${relativeFilepath}`;
        fileContent = (0, fs_1.getFileContent)(absoluteFilePath);
        fileCache.set(relativeFilepath, fileContent);
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
    _1.store.data.set(relativeFilepath, fileContent.json || fileContent.raw);
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
        // Delete file contents from cache.
        cache_1.cache.bin('file').delete(relativeFilepath);
        // Delete file contents from store.
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
};

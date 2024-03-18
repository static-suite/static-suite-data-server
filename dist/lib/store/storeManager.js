"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeManager = void 0;
const config_1 = require("../config");
const fs_1 = require("../utils/fs");
const hook_1 = require("./hook");
const _1 = require(".");
const include_1 = require("./include");
const dependencyFileHelper_1 = require("./dependency/dependencyFileHelper");
const dependencyTagger_1 = require("./dependency/dependencyTagger");
/**
 * Sets a file into the store, regardless of being already added or not.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
 *
 * @returns Object with two properties:
 *  fileContent: the contents of the stored file
 *  previousStoredData: the contents of the previously stored file
 */
const setFileIntoStore = (relativeFilepath) => {
    const absoluteFilePath = `${config_1.config.dataDir}/${relativeFilepath}`;
    let fileContent = (0, fs_1.getFileContent)(absoluteFilePath);
    // Invoke "process file" hook.
    fileContent = hook_1.hookManager.invokeOnProcessFile({
        relativeFilepath,
        fileContent,
    });
    let previousStoredData = null;
    const dataToStore = fileContent.json || fileContent.raw;
    const currentData = _1.store.data.get(relativeFilepath);
    let skipUpdating = false;
    if (fileContent.json) {
        // Check if the object already exists to make sure we don't break the reference
        if (dataToStore && typeof dataToStore === 'object') {
            if (currentData) {
                // Delete include dependencies.
                dependencyFileHelper_1.dependencyIncludeHelper.deleteIncludeDependencies(relativeFilepath, currentData);
                // Remove previous data from URL index.
                const url = currentData.data?.content?.url?.path;
                if (url) {
                    _1.store.index.url.delete(url);
                }
                // Remove previous data from UUID index.
                const uuid = currentData.data?.content?.uuid;
                const langcode = currentData.data?.content?.langcode?.value;
                if (uuid && langcode) {
                    _1.store.index.uuid.get(langcode)?.delete(uuid);
                }
                // Delete all referenced object properties and copy them to another object.
                previousStoredData = currentData.data?.content
                    ? { data: { content: {} } }
                    : {};
                if (currentData.metadata) {
                    // We cannot use structuredClone to clone the whole JSON,
                    // since proxies used by queries are not supported by structuredClone.
                    previousStoredData.metadata = structuredClone(currentData.metadata);
                }
                const previousStoredDataPointer = previousStoredData.data?.content || previousStoredData;
                const currentDataPointer = currentData.data?.content || currentData;
                Object.keys(currentDataPointer).forEach(key => {
                    previousStoredDataPointer[key] = currentDataPointer[key];
                    delete currentDataPointer[key];
                });
                // Hydrate new object properties into referenced object
                const dataToStorePointer = dataToStore.data?.content || dataToStore;
                Object.keys(dataToStorePointer).forEach(key => {
                    currentDataPointer[key] = dataToStorePointer[key];
                });
                if (dataToStore.metadata) {
                    currentData.metadata = dataToStore.metadata;
                }
                else {
                    delete currentData.metadata;
                }
                skipUpdating = true;
            }
            // Add data to UUID index.
            const uuid = dataToStore.data?.content?.uuid;
            const langcode = dataToStore.data?.content?.langcode?.value;
            if (uuid && langcode) {
                const langcodeMap = _1.store.index.uuid.get(langcode) ||
                    _1.store.index.uuid.set(langcode, new Map()).get(langcode);
                langcodeMap.set(uuid, dataToStore);
            }
            // Add data to URL index.
            const url = dataToStore.data?.content?.url?.path;
            if (url) {
                _1.store.index.url.set(url, dataToStore);
            }
            // Add include dependencies.
            dependencyFileHelper_1.dependencyIncludeHelper.addIncludeDependencies(relativeFilepath, dataToStore);
        }
    }
    else {
        previousStoredData = currentData;
    }
    if (!skipUpdating) {
        _1.store.data.set(relativeFilepath, dataToStore);
    }
    // Remove this path from store.deleted
    _1.store.deleted.delete(relativeFilepath);
    return { fileContent: dataToStore, previousStoredData };
};
exports.storeManager = {
    add: (relativeFilepath) => {
        const { fileContent } = setFileIntoStore(relativeFilepath);
        // Invoke "store add" hook.
        hook_1.hookManager.invokeOnStoreItemAdd({
            relativeFilepath,
            storeItem: fileContent,
        });
        return exports.storeManager;
    },
    update: (relativeFilepath) => {
        const storedData = _1.store.data.get(relativeFilepath);
        if (storedData) {
            hook_1.hookManager.invokeOnStoreItemBeforeUpdate({
                relativeFilepath,
                storeItem: storedData,
            });
        }
        const { fileContent, previousStoredData } = setFileIntoStore(relativeFilepath);
        // Invalidate this item.
        dependencyTagger_1.dependencyTagger.invalidateTags([relativeFilepath]);
        // Invoke "store update" hook.
        hook_1.hookManager.invokeOnStoreItemAfterUpdate({
            relativeFilepath,
            storeItem: fileContent,
            previousStoreItem: previousStoredData,
        });
        return exports.storeManager;
    },
    remove: (relativeFilepath) => {
        // Get stored data before removing it from store.
        const storedData = _1.store.data.get(relativeFilepath);
        if (storedData) {
            // Remove data from URL index.
            const url = storedData.data?.content?.url?.path;
            if (url) {
                _1.store.index.url.delete(url);
            }
            // Remove data from UUID index.
            const uuid = storedData.data?.content?.uuid;
            const langcode = storedData.data?.content?.langcode?.value;
            if (uuid && langcode) {
                _1.store.index.uuid.get(langcode)?.delete(uuid);
            }
        }
        // Delete file contents from store.
        _1.store.data.delete(relativeFilepath);
        // Save its path in store.deleted for future reference.
        _1.store.deleted.add(relativeFilepath);
        // Invalidate this item.
        dependencyTagger_1.dependencyTagger.invalidateTags([relativeFilepath]);
        // Invoke "store remove" hook.
        hook_1.hookManager.invokeOnStoreItemDelete({
            relativeFilepath,
            storeItem: storedData,
        });
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
    reset: () => {
        (0, _1.resetStore)();
        return exports.storeManager;
    },
};

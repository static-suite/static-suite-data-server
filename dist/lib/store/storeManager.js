"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeManager = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("@lib/config");
const fs_1 = require("@lib/utils/fs");
const string_1 = require("@lib/utils/string");
const logger_1 = require("@lib/utils/logger");
const cache_1 = require("@lib/utils/cache");
const object_1 = require("@lib/utils/object");
const store_constants_1 = require("./store.constants");
const hook_1 = require("./hook");
const _1 = require(".");
const includeParser_1 = require("./includeParser/includeParser");
/**
 * Add a file to JSON items inside a data lead.
 *
 * @param dataLeaf - Data lead to act on.
 * @param relativeFilePath - Relative file path to be removed.
 * @param jsonFileContents - JSON contents to be added.
 */
const addFileToJsonItems = (dataLeaf, relativeFilePath, jsonFileContents) => {
    const leaf = dataLeaf;
    // Add __FILENAME__ to json so it can be found later.
    const json = jsonFileContents;
    json.__FILENAME__ = relativeFilePath;
    // Check whether file is a regular one or a variant
    const variantKey = (0, string_1.getVariantKey)(relativeFilePath);
    // Take variant into account.
    if (variantKey) {
        // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
        if (!leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey]) {
            leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey] = [];
        }
        leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey].push(json);
    }
    else {
        leaf[store_constants_1.JSON_ITEMS][store_constants_1.MAIN].push(json);
    }
};
/**
 * Removes a file from JSON items inside a data lead.
 *
 * @param dataLeaf - Data lead to act on.
 * @param relativeFilePath - Relative file path to be removed.
 */
const removeFileFromJsonItems = (dataLeaf, relativeFilePath) => {
    const leaf = dataLeaf;
    // Check whether file is a regular one or a variant
    const variantKey = (0, string_1.getVariantKey)(relativeFilePath);
    // Take variant into account.
    if (variantKey) {
        // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
        if (leaf?.[store_constants_1.JSON_ITEMS]?.[store_constants_1.VARIANTS]?.[variantKey]) {
            const fileIndex = leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey].findIndex(item => item?.__FILENAME__ === relativeFilePath);
            leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey].splice(fileIndex, 1);
            // Delete variant group if empty.
            if (leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey].length === 0) {
                delete leaf[store_constants_1.JSON_ITEMS][store_constants_1.VARIANTS][variantKey];
            }
        }
    }
    else if (leaf?.[store_constants_1.JSON_ITEMS]?.[store_constants_1.MAIN]) {
        const fileIndex = leaf[store_constants_1.JSON_ITEMS][store_constants_1.MAIN].findIndex((item) => item?.__FILENAME__ === relativeFilePath);
        leaf[store_constants_1.JSON_ITEMS][store_constants_1.MAIN].splice(fileIndex, 1);
    }
};
/**
 * Tells whether pathParts meets required requirements
 *
 * @param pathParts - An array with the parts of a file path.
 *
 * @returns True if requirements are met, false otherwise.
 */
const meetsPathRequirements = (pathParts) => {
    // Check that path does not contain the reserved name JSON_ITEMS.
    if (pathParts?.includes(store_constants_1.JSON_ITEMS)) {
        logger_1.logger.warn(`Skipping file "${pathParts.join('/')}" since it contains "${store_constants_1.JSON_ITEMS}", a reserved name. Please, rename it.`);
        return false;
    }
    return true;
};
exports.storeManager = {
    add: (relativeFilepath, options = { useCache: false }) => {
        const pathParts = relativeFilepath.split('/');
        // Check that path meets requirements.
        if (!meetsPathRequirements(pathParts)) {
            return _1.store;
        }
        const filePath = path_1.default.join(config_1.config.dataDir, relativeFilepath);
        if (!options.useCache || !cache_1.cache.bin('file').get(filePath)) {
            cache_1.cache.bin('file').set(filePath, (0, fs_1.getFileContent)(filePath));
        }
        // Using "as FileType" because we are sure that it will not return undefined,
        // since its value has been set by ourselves.
        let fileContent = cache_1.cache.bin('file').get(filePath);
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
        const rootLeaf = _1.store.data;
        let leaf = rootLeaf;
        const pathPartsLength = pathParts.length;
        pathParts.forEach((part, index) => {
            // When processing the last part of the path (the filename), add its contents
            // to the object, with the filename as a property.
            const isFilenamePart = pathPartsLength === index + 1;
            if (isFilenamePart) {
                const leafFileContent = fileContent.json || fileContent.raw;
                if (leafFileContent) {
                    leaf[part] = leafFileContent;
                    // Add data to root JSON_ITEMS
                    if (fileContent.json) {
                        addFileToJsonItems(rootLeaf, relativeFilepath, fileContent.json);
                    }
                    _1.store.data[store_constants_1.INDEX].set(relativeFilepath, leafFileContent);
                }
            }
            else {
                // If it's a directory, create structure and add to JSON_ITEMS.
                // Ensure leaf[part] is an object with MAIN and VARIANTS. This must
                // be done here, to ensure proper structure is created, even when we
                // find a directory with only one non-JSON_ITEMS file.
                if (!leaf[part]) {
                    leaf[part] = (0, object_1.deepClone)(_1.storeDataSkeleton);
                }
                // Add data to leaf JSON_ITEMS
                if (fileContent.json) {
                    addFileToJsonItems(leaf[part], relativeFilepath, fileContent.json);
                }
                // Step into next leaf.
                if (leaf[part]) {
                    leaf = leaf[part];
                }
            }
        });
        // Invoke "store add" hook.
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreAdd) {
                hookModule.onStoreAdd({
                    dataDir: config_1.config.dataDir,
                    relativeFilepath,
                    fileContent,
                    store: _1.store,
                });
            }
        });
        return _1.store;
    },
    remove: (relativeFilepath) => {
        const pathParts = relativeFilepath.split('/');
        let leaf = _1.store.data;
        const pathPartsLength = pathParts.length;
        pathParts.forEach((part, index) => {
            // When processing the last part of the path (the filename), add its contents
            // to the object, with a property which is the filename.
            const isFilenamePart = pathPartsLength === index + 1;
            if (isFilenamePart) {
                delete leaf[part];
                removeFileFromJsonItems(_1.store.data, relativeFilepath);
                _1.store.data[store_constants_1.INDEX].delete(relativeFilepath);
            }
            else {
                removeFileFromJsonItems(leaf[part], relativeFilepath);
            }
            // Step into next leaf.
            if (leaf[part]) {
                leaf = leaf[part];
            }
        });
        // Invoke "store remove" hook.
        const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreRemove) {
                hookModule.onStoreRemove({
                    dataDir: config_1.config.dataDir,
                    relativeFilepath,
                    store: _1.store,
                });
            }
        });
        return _1.store;
    },
    update: (relativeFilepath) => {
        exports.storeManager.remove(relativeFilepath);
        exports.storeManager.add(relativeFilepath);
        return _1.store;
    },
    includeParse: () => {
        _1.store.data[store_constants_1.INDEX].forEach((fileContent) => {
            exports.storeManager.includeParseFile(fileContent);
        });
        _1.store.data[store_constants_1.INDEX].forEach((fileContent) => {
            includeParser_1.includeParser.dinamic.run(fileContent);
        });
        return _1.store;
    },
    includeParseFile: (fileContent) => {
        includeParser_1.includeParser.static.run(fileContent);
        return _1.store;
    },
};

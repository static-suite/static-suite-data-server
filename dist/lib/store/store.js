"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = require("@lib/utils/fs");
const logger_1 = require("@lib/utils/logger");
const cache_1 = require("@lib/utils/cache");
const object_1 = require("@lib/utils/object");
const postProcessor_1 = require("./postProcessor");
const JSON_ITEMS = '_json';
const MAIN = 'main';
const VARIANTS = 'variants';
const addFileToJsonItems = (dataLeaf, file, jsonFileContents) => {
    const leaf = dataLeaf;
    // Add __FILENAME__ to json so it can be found later.
    const json = jsonFileContents;
    json.__FILENAME__ = file;
    // Check whether file is a regular one or a variant
    const variantKey = (0, fs_1.getVariantKey)(file);
    // Take variant into account.
    if (variantKey) {
        // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
        if (!leaf[JSON_ITEMS][VARIANTS][variantKey]) {
            leaf[JSON_ITEMS][VARIANTS][variantKey] = [];
        }
        leaf[JSON_ITEMS][VARIANTS][variantKey].push(json);
    }
    else {
        leaf[JSON_ITEMS][MAIN].push(json);
    }
};
const removeFileFromJsonItems = (dataLeaf, file) => {
    const leaf = dataLeaf;
    // Check whether file is a regular one or a variant
    const variantKey = (0, fs_1.getVariantKey)(file);
    // Take variant into account.
    if (variantKey) {
        // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
        if (leaf?.[JSON_ITEMS]?.[VARIANTS]?.[variantKey]) {
            const fileIndex = leaf[JSON_ITEMS][VARIANTS][variantKey].findIndex(item => item?.__FILENAME__ === file);
            leaf[JSON_ITEMS][VARIANTS][variantKey].splice(fileIndex, 1);
            // Delete variant group if empty.
            if (leaf[JSON_ITEMS][VARIANTS][variantKey].length === 0) {
                delete leaf[JSON_ITEMS][VARIANTS][variantKey];
            }
        }
    }
    else if (leaf?.[JSON_ITEMS]?.[MAIN]) {
        const fileIndex = leaf[JSON_ITEMS][MAIN].findIndex((item) => item?.__FILENAME__ === file);
        leaf[JSON_ITEMS][MAIN].splice(fileIndex, 1);
    }
};
// Tells whether pathParts meets required requirements
const meetsPathRequirements = (pathParts) => {
    // Check that path does not contain the reserved name JSON_ITEMS.
    if (pathParts?.includes(JSON_ITEMS)) {
        logger_1.logger.warn(`Skipping file "${pathParts.join('/')}" since it contains "${JSON_ITEMS}", a reserved name. Please, rename it.`);
        return false;
    }
    return true;
};
// A skeleton for the data in the store.
const storeDataSkeleton = {
    [JSON_ITEMS]: {
        [MAIN]: [],
        [VARIANTS]: {},
    },
};
/**
 * @typedef {Object} Store
 * @property {Date} updated - Date to tell when was the store last updated.
 * @property {Object} data - Object that holds all data.
 * @property {Function} add - Add a file to the store
 * @property {Function} remove - Remove a file from the store
 */
exports.store = {
    /**
     * Date to tell when was the store last updated.
     */
    updated: null,
    /**
     * Object that holds all data for all path files.
     *
     * Every directory path contains an special entry named "_json", which is an
     * object that contains "main" and "variants":
     *  - "main":     an array that contains, recursively, all files inside that directory
     *                that are not a variant.
     *  - "variants": an object keyed with available variants, that contains, recursively,
     *                all variants inside that directory.
     *
     * @example
     * // Find articles that contain "foo" inside their title.
     * const results = store.data.en.entity.node.article._json.main.filter(
     *    article => article.data.content.title.indexOf('foo') !== 1
     * );
     *
     * @example
     * // Find "teaser" article variants that contain "foo" inside their title.
     * const results = store.data.en.entity.node.article._json.variant.teaser.filter(
     *    article => article.data.content.title.indexOf('foo') !== 1
     * );
     */
    data: (0, object_1.deepClone)(storeDataSkeleton),
    /**
     * Temporary object to be able to make changes to data without touching "store.data".
     */
    stage: (0, object_1.deepClone)(storeDataSkeleton),
    /**
     * Add a file to the store, into a tree structure.
     *
     * Each file is stored in a tree-like object, where directories and filenames
     * are transformed into object properties. For example, the filepath
     * "/en/entity/node/article/40000/41234.json" is transformed into:
     * store.data.en.entity.node.article['40000']['41234.json']
     *
     * Every JSON_ITEMS file is also added to a special "_json" object inside every
     * tree leaf, so the above file will be available in:
     * store.data._json.main
     * store.data.en._json.main
     * store.data.en.entity._json.main
     * store.data.en.entity.node._json.main
     * store.data.en.entity.node.article._json.main
     * store.data.en.entity.node.article['40000']._json.main
     *
     * Given a variant file named "/en/entity/node/article/40000/41234--teaser.json",
     * it would be added to the following "_json" object:
     * store.data._json.variants.teaser
     * store.data.en._json.variants.teaser
     * store.data.en.entity._json.variants.teaser
     * store.data.en.entity.node._json.variants.teaser
     * store.data.en.entity.node.article._json.variants.teaser
     * store.data.en.entity.node.article['40000']._json.variants.teaser
     *
     * This way, queries can be run on any set of data, limiting the amount of data to by analyzed.
     *
     * Each "_json" contains all files inside that level, recursively.
     * For example:
     * - "store.data._json" contains all files in the store
     * - "store.data.en.entity.node.article._json" contains all articles in the store
     *
     * @param {string} dataDir - Relative path to the data directory where files are stored.
     * @param {string} file - Relative path to the file to be added.
     * @param {Object} options Configuration options
     * @param {boolean} options.useStage - Add data to a temporary "store.stage" that will later replace "store.data".
     * @param {boolean} options.useCache - Obtain data from cache.
     *
     * @return {Store} store - The store object, to allow chaining.
     */
    add: (dataDir, file, options = { useStage: false, useCache: false }) => {
        const pathParts = file.split('/');
        // Check that path meets requirements.
        if (!meetsPathRequirements(pathParts)) {
            return exports.store;
        }
        const filePath = path_1.default.join(dataDir, file);
        if (!options.useCache || !cache_1.cache.get('file', filePath)) {
            cache_1.cache.set('file', filePath, (0, fs_1.getFileContent)(filePath));
        }
        let fileContent = cache_1.cache.get('file', filePath);
        // Post process file.
        const postProcessor = postProcessor_1.postProcessorManager.getPostProcessor();
        if (postProcessor?.processFile) {
            fileContent = postProcessor.processFile(dataDir, file, fileContent, exports.store);
        }
        const rootLeaf = options.useStage ? exports.store.stage : exports.store.data;
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
                        addFileToJsonItems(rootLeaf, file, fileContent.json);
                    }
                }
            }
            else {
                // If it's a directory, create structure and add to JSON_ITEMS.
                // Ensure leaf[part] is an object with MAIN and VARIANTS. This must
                // be done here, to ensure proper structure is created, even when we
                // find a directory with only one non-JSON_ITEMS file.
                if (!leaf[part]) {
                    leaf[part] = (0, object_1.deepClone)(storeDataSkeleton);
                }
                // Add data to leaf JSON_ITEMS
                if (fileContent.json) {
                    addFileToJsonItems(leaf[part], file, fileContent.json);
                }
                // Step into next leaf.
                if (leaf[part]) {
                    leaf = leaf[part];
                }
            }
        });
        // Post process file.
        if (postProcessor?.storeAdd) {
            postProcessor.storeAdd(dataDir, file, fileContent, exports.store);
        }
        return exports.store;
    },
    /**
     * Remove a file from the store.
     *
     * It removes the object and all its references across the tree structure.
     *
     * @param {string} file - Relative path to the file to be removed.
     *
     * @return {Store} store - The store object, to allow chaining.
     */
    remove: (file) => {
        const pathParts = file.split('/');
        let leaf = exports.store.data;
        const pathPartsLength = pathParts.length;
        pathParts.forEach((part, index) => {
            // When processing the last part of the path (the filename), add its contents
            // to the object, with a property which is the filename.
            const isFilenamePart = pathPartsLength === index + 1;
            if (isFilenamePart) {
                delete leaf[part];
                removeFileFromJsonItems(exports.store.data, file);
            }
            else {
                removeFileFromJsonItems(leaf[part], file);
            }
            // Step into next leaf.
            if (leaf[part]) {
                leaf = leaf[part];
            }
        });
        // Post process file.
        const postProcessor = postProcessor_1.postProcessorManager.getPostProcessor();
        if (postProcessor?.storeRemove) {
            postProcessor.storeRemove(file, exports.store);
        }
        return exports.store;
    },
    /**
     * Updates a file from the store.
     *
     * It removes the object and all its references across the tree structure, and
     * adds it again to the structure.
     *
     * @param {string} dataDir - Relative path to the data directory where files are stored.
     * @param {string} file - Relative path to the file to be updated.
     *
     * @return {Store} store - The store object, to allow chaining.
     */
    update: (dataDir, file) => {
        exports.store.remove(file);
        exports.store.add(dataDir, file);
        return exports.store;
    },
    /**
     * Get a file from the store.
     *
     * @param {string} file - Relative path to the file to be retrieved.
     *
     * @return {(Array|Object|null)} An array or object coming from JSON, or a string otherwise.
    get: (file: string): [] | object | string | null => {
      const pathParts = file.split('/');
      return pathParts.reduce((prev, curr) => prev && prev[curr], store.data);
    },
     */
    /**
     * Promotes data stored in "store.stage" to "store.data".
     *
     * @return {Store} store - The store object, to allow chaining.
     */
    promoteStage: () => {
        exports.store.data = exports.store.stage;
        exports.store.stage = (0, object_1.deepClone)(storeDataSkeleton);
        return exports.store;
    },
};

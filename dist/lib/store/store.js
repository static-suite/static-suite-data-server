"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetStore = exports.store = void 0;
const microtime_1 = __importDefault(require("microtime"));
const string_1 = require("../utils/string");
const logger_1 = require("../utils/logger");
const cache_1 = require("../utils/cache");
const workDir_1 = require("./workDir");
// Instantiate the subset cache so it can be accessed faster.
const subsetCache = cache_1.cache.bin('store-subset');
const initIndex = () => {
    return {
        url: new Map(),
        uuid: new Map(),
        custom: new Map(),
    };
};
const initData = () => new Map();
exports.store = {
    initialUniqueId: workDir_1.unixEpochUniqueId,
    currentUniqueId: workDir_1.unixEpochUniqueId,
    data: initData(),
    deleted: new Set(),
    index: initIndex(),
};
exports.store.data.subset = (options) => {
    const startDate = microtime_1.default.now();
    // Merge provided options with default ones.
    const defaultOptions = {
        variant: '_main',
        ext: 'json',
        recursive: 'true',
    };
    const opts = { ...defaultOptions, ...options };
    let subset = { map: new Map(), filenames: [], items: [] };
    const dirWithTrimmedSlashes = opts.dir?.replace(/^\//, '').replace(/\/$/, '');
    const dirPart = dirWithTrimmedSlashes ? `${dirWithTrimmedSlashes}/` : '';
    let variantPart;
    if (opts.variant) {
        const recursiveGroup = opts.recursive ? '.' : '[^/]';
        variantPart =
            opts.variant === '_main'
                ? `((?!--)${recursiveGroup})+`
                : `${recursiveGroup}+${string_1.VARIANT_SEPARATOR}${opts.variant}`;
    }
    else {
        variantPart = '';
    }
    let extensionPart;
    if (opts.recursive) {
        extensionPart = opts.ext ? `.${opts.ext}` : '.+';
    }
    else {
        extensionPart = opts.ext ? `.${opts.ext}` : '[^/]+';
    }
    const pattern = `^${dirPart}${variantPart}${extensionPart}$`;
    logger_1.logger.debug(`Store subset pattern: ${pattern}`);
    const cachedSubset = subsetCache.get(pattern);
    if (cachedSubset) {
        subset = cachedSubset;
        logger_1.logger.debug(`Store subset obtained from cache in ${(microtime_1.default.now() - startDate) / 1000}ms. ${subset.items.length} items.`);
    }
    else {
        const regex = new RegExp(pattern);
        const mapKeys = Array.from(exports.store.data.keys());
        mapKeys.forEach(k => {
            if (k.match(regex)) {
                const storeItem = exports.store.data.get(k);
                subset.map.set(k, storeItem);
                subset.filenames.push(k);
                subset.items.push(storeItem);
            }
        });
        subsetCache.set(pattern, subset);
        logger_1.logger.debug(`Store subset created in ${(microtime_1.default.now() - startDate) / 1000} ms. ${subset.items.length} items.`);
    }
    return subset;
};
/**
 * Resets store and deletes all loaded data.
 */
const resetStore = () => {
    exports.store.initialUniqueId = workDir_1.unixEpochUniqueId;
    exports.store.currentUniqueId = workDir_1.unixEpochUniqueId;
    const previousSubset = exports.store.data.subset;
    exports.store.data = initData();
    exports.store.data.subset = previousSubset;
    subsetCache.clear();
    exports.store.deleted.clear();
    exports.store.index = initIndex();
};
exports.resetStore = resetStore;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
const microtime_1 = __importDefault(require("microtime"));
const string_1 = require("@lib/utils/string");
const logger_1 = require("@lib/utils/logger");
const cache_1 = require("@lib/utils/cache");
// Instantiate the subset cache so it can be accessed faster.
const subsetCache = cache_1.cache.bin('store-subset');
exports.store = {
    syncDate: null,
    data: new Map(),
    index: {
        url: new Map(),
        uuid: new Map(),
        include: {
            static: new Map(),
            dynamic: new Map(),
        },
        custom: new Map(),
    },
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
    let subset = { filenames: [], items: [] };
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
                subset.filenames.push(k);
                subset.items.push(exports.store.data.get(k));
            }
        });
        subsetCache.set(pattern, subset);
        logger_1.logger.debug(`Store subset created in ${(microtime_1.default.now() - startDate) / 1000} ms. ${subset.items.length} items.`);
    }
    return subset;
};

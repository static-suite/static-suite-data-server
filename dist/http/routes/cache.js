"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheClear = exports.cacheIndex = void 0;
const cache_1 = require("@lib/utils/cache");
const cacheIndex = (req, res) => {
    const cacheBins = Array.from(cache_1.cache.keys());
    res.render('cacheIndex', { cacheBins });
};
exports.cacheIndex = cacheIndex;
const cacheClear = (req, res) => {
    const cacheBinId = req.params[0];
    let done = false;
    if (cache_1.cache.has(cacheBinId)) {
        cache_1.cache.bin(cacheBinId).clear();
        done = true;
    }
    res.render('cacheClear', { cacheBinId, done });
};
exports.cacheClear = cacheClear;

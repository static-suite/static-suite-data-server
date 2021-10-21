"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const data = new Map();
const initBin = (bin) => {
    data.set(bin, new Map());
};
/**
 * Cache system based on specialized bins.
 *
 * All cache items belong to a specific bin ("file", "query", etc),
 * which is a kind of "folder" or "directory" where data belonging
 * to the same context/domain is stored altogether.
 */
exports.cache = {
    /**
     * Sets a value in the cache.
     *
     * @param bin - The id of the bin
     * @param key - The key for the data to be stored
     * @param value - The value to be stored
     */
    set: (bin, key, value) => {
        if (!data.has(bin)) {
            initBin(bin);
        }
        data.get(bin)?.set(key, value);
    },
    /**
     * Gets a value from the cache.
     *
     * @param bin - The id of the bin
     * @param key - The key to be retrieved
     * @typeParam Type - Type of returned value
     */
    get: (bin, key) => data.get(bin)?.get(key),
    /**
     * Deletes a value from the cache.
     *
     * @param bin - The id of the bin
     * @param key - The key to be deleted
     * @returns True on success, or false otherwise.
     */
    delete: (bin, key) => data.get(bin)?.delete(key) || false,
    /**
     * Count elements inside a cache bin
     *
     * @param bin - The id of the bin
     * @returns The number of elements inside a cache bin
     */
    count: (bin) => data.get(bin)?.size || 0,
    /**
     * Resets and empties a cache bin.
     *
     * @param bin - The id of the bin
     */
    reset: (bin) => initBin(bin),
};

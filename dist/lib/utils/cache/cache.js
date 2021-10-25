"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const data = new Map();
const cacheBin = (bin) => {
    return {
        /**
         * Sets a value in the cache.
         *
         * @param key - The key for the data to be stored
         * @param value - The value to be stored
         */
        set: (key, value) => {
            bin.set(key, value);
        },
        /**
         * Gets a value from the cache.
         *
         * @param key - The key to be retrieved
         * @typeParam Type - Type of returned value
         */
        get: (key) => bin.get(key),
        /**
         * Deletes a value from the cache.
         *
         * @param key - The key to be deleted
         * @returns True on success, or false otherwise.
         */
        delete: (key) => bin.delete(key) || false,
        /**
         * Deletes a value from the cache.
         *
         * @returns True on success, or false otherwise.
         */
        count: () => bin.size,
    };
};
const initBin = (binId) => {
    data.set(binId, cacheBin(new Map()));
    return data.get(binId);
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
     * @param binId - The id of the bin
     * @param key - The key for the data to be stored
     * @param value - The value to be stored
     */
    bin: (binId) => {
        return data.has(binId) ? data.get(binId) : initBin(binId);
    },
    /**
     * Sets a value in the cache.
     *
     * @param binId - The id of the bin
     * @param key - The key for the data to be stored
     * @param value - The value to be stored
     */
    keys: () => Array.from(data.keys()),
    /**
     * Resets and empties a cache bin.
     *
     * @param binId - The id of the bin
     */
    reset: (binId) => initBin(binId),
};

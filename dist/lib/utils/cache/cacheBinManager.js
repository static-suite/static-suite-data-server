"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const data = new Map();
/**
 * Initializes a cache bin.
 *
 * @remarks
 * If a cache bin already exists, it clears it, creating a new one.
 * If the cache bin doesn't exist, it simply creates it.
 *
 * @param binId - The id of the bin.
 * @returns The initialized cache bin.
 *
 */
const initBin = (binId) => {
    data.set(binId, new Map());
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
     * Gets a cache bin by its id.
     *
     * @param binId - The id of the bin.
     * @returns The cache bin.
     */
    bin: (binId) => {
        return exports.cache.has(binId)
            ? data.get(binId)
            : initBin(binId);
    },
    /**
     * Returns a boolean indicating whether a cache bin
     * with the specified key exists or not.
     *
     * @param binId - The id of the bin.
     * @returns True if the cache bin exists, false otherwise.
     */
    has: (binId) => data.has(binId),
    /**
     * Gets an array of keys of all available cache bins.
     *
     * @returns An array of cache bin keys.
     */
    keys: () => Array.from(data.keys()),
};

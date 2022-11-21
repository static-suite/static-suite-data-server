"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
/**
 * Keeps a list of consumed bins to be able to clear them later.
 *
 * "data" is a Map and its bins can be removed, but those bins are
 * Maps at the same time. That leads to having bin objects used by
 * some module that cannot be cleared when Cache::clear() runs.
 *
 */
const consumedBins = new Map();
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
    const bin = new Map();
    data.set(binId, bin);
    consumedBins.set(binId, bin);
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
    bin: (binId) => {
        return data.get(binId) || initBin(binId);
    },
    /**
     * Returns a boolean indicating whether a cache bin
     * with the specified key exists or not.
     *
     * @param binId - The id of the bin.
     * @returns True if the cache bin exists, false otherwise.
     */
    has: binId => data.has(binId),
    /**
     * Gets an array of keys of all available cache bins.
     *
     * @returns An array of cache bin keys.
     */
    keys: () => Array.from(data.keys()),
    /**
     * Deletes all available cache bins.
     */
    clear: () => {
        consumedBins.forEach(bin => {
            bin.clear();
        });
        data.clear();
    },
};

export declare type CacheBin<Type> = Map<string, Type>;
export declare type Cache = {
    /**
     * Gets a cache bin by its id.
     *
     * @param binId - The id of the bin.
     * @returns The cache bin.
     */
    bin<Type>(binId: string): CacheBin<Type>;
    /**
     * Returns a boolean indicating whether a cache bin
     * with the specified key exists or not.
     *
     * @param binId - The id of the bin.
     * @returns True if the cache bin exists, false otherwise.
     */
    has(binId: string): boolean;
    /**
     * Gets an array of keys of all available cache bins.
     *
     * @returns An array of cache bin keys.
     */
    keys(): string[];
    /**
     * Clears all available cache bins.
     */
    clear(): void;
};
/**
 * Cache system based on specialized bins.
 *
 * All cache items belong to a specific bin ("file", "query", etc),
 * which is a kind of "folder" or "directory" where data belonging
 * to the same context/domain is stored altogether.
 */
export declare const cache: Cache;
//# sourceMappingURL=cacheBinManager.d.ts.map
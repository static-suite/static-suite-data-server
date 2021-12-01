export declare type CacheBin<Type> = Map<string, Type>;
/**
 * Cache system based on specialized bins.
 *
 * All cache items belong to a specific bin ("file", "query", etc),
 * which is a kind of "folder" or "directory" where data belonging
 * to the same context/domain is stored altogether.
 */
export declare const cache: {
    /**
     * Gets a cache bin by its id.
     *
     * @param binId - The id of the bin.
     * @returns The cache bin.
     */
    bin: <Type>(binId: string) => CacheBin<Type>;
    /**
     * Gets an array of keys of all available cache bins.
     *
     * @returns An array of cache bin keys.
     */
    keys: () => string[];
};
//# sourceMappingURL=cacheBinManager.d.ts.map
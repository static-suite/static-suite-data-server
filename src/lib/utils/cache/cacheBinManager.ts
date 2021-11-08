type CacheBin<Type> = Map<string, Type>;

const data = new Map<string, CacheBin<any>>();

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
const initBin = <Type>(binId: string): CacheBin<Type> => {
  data.set(binId, new Map<string, Type>());
  return data.get(binId) as CacheBin<Type>;
};

/**
 * Cache system based on specialized bins.
 *
 * All cache items belong to a specific bin ("file", "query", etc),
 * which is a kind of "folder" or "directory" where data belonging
 * to the same context/domain is stored altogether.
 */
export const cache = {
  /**
   * Gets a cache bin by its id.
   *
   * @param binId - The id of the bin.
   * @returns The cache bin.
   */
  bin: <Type>(binId: string): CacheBin<Type> => {
    return data.has(binId)
      ? (data.get(binId) as CacheBin<Type>)
      : initBin<Type>(binId);
  },

  /**
   * Gets the keys of all available cache bins.
   *
   * @returns An array of cache bin keys.
   */
  keys: (): string[] => Array.from(data.keys()),

  /**
   * Resets a cache bin, clearing its contents.
   *
   * @param binId - The id of the bin.
   * @returns  The cleared cache bin.
   */
  reset: <Type>(binId: string): CacheBin<Type> => initBin<Type>(binId),
};

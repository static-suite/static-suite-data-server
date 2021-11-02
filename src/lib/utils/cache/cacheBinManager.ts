type CacheBin = Map<string, any>;

const data = new Map<string, CacheBin>();

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
const initBin = (binId: string): CacheBin => {
  data.set(binId, new Map<string, any>());
  return data.get(binId) as CacheBin;
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
  bin: (binId: string): CacheBin => {
    return data.has(binId) ? (data.get(binId) as CacheBin) : initBin(binId);
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
  reset: (binId: string): CacheBin => initBin(binId),
};

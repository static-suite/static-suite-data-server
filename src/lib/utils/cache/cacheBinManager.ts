export type CacheBin<Type> = Map<string, Type>;

export type Cache = {
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
 * Keeps a list of consumed bins to be able to clear them later.
 *
 * "data" is a Map and its bins can be removed, but those bins are
 * Maps at the same time. That leads to having bin objects used by
 * some module that cannot be cleared when Cache::clear() runs.
 *
 */
const consumedBins = new Map<string, CacheBin<any>>();

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
  const bin = new Map<string, Type>();
  data.set(binId, bin);
  consumedBins.set(binId, bin);
  return data.get(binId) as CacheBin<Type>;
};

/**
 * Cache system based on specialized bins.
 *
 * All cache items belong to a specific bin ("file", "query", etc),
 * which is a kind of "folder" or "directory" where data belonging
 * to the same context/domain is stored altogether.
 */
export const cache: Cache = {
  bin: <Type>(binId: string): CacheBin<Type> => {
    return (data.get(binId) as CacheBin<Type>) || initBin<Type>(binId);
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
   * Clears all consumed cache bins.
   */
  clear: () => {
    consumedBins.forEach((bin, binId) => {
      bin.clear();
      consumedBins.delete(binId);
    });
    data.clear();
  },
};

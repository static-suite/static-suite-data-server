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
   * Gets an array of keys of all available cache bins.
   *
   * @returns An array of cache bin keys.
   */
  clear: () => {
    data.clear();
  },
};

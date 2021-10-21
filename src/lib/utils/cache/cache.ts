const data = new Map<string, Map<string, any>>();

const initBin = (bin: string): void => {
  data.set(bin, new Map<string, any>());
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
   * Sets a value in the cache.
   *
   * @param bin - The id of the bin
   * @param key - The key for the data to be stored
   * @param value - The value to be stored
   */
  set: (bin: string, key: string, value: unknown): void => {
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
  get: <Type>(bin: string, key: string): Type => data.get(bin)?.get(key),

  /**
   * Deletes a value from the cache.
   *
   * @param bin - The id of the bin
   * @param key - The key to be deleted
   * @returns True on success, or false otherwise.
   */
  delete: (bin: string, key: string): boolean =>
    data.get(bin)?.delete(key) || false,

  /**
   * Count elements inside a cache bin
   *
   * @param bin - The id of the bin
   * @returns The number of elements inside a cache bin
   */
  count: (bin: string): number => data.get(bin)?.size || 0,

  /**
   * Resets and empties a cache bin.
   *
   * @param bin - The id of the bin
   */
  reset: (bin: string): void => initBin(bin),
};

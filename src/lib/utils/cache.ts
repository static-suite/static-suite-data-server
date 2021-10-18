const data = new Map<string, Map<string, any>>();

const initBin = (bin: string): void => {
  data.set(bin, new Map<string, any>());
};

/**
 * Returns the average of two numbers.
 *
 * @remarks
 * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
 *
 * @param bin - The name of the bin
 * @param y - The second input number
 * @returns The arithmetic mean of `x` and `y`
 *
 * @beta
 */
export const cache = {
  /**
   * Returns the average of two numbers.
   *
   * @remarks
   * This method is part of the {@link core-library#Statistics | Statistics subsystem}.
   *
   * @param bin - The name of the bin
   * @param y - The second input number
   * @returns The arithmetic mean of `x` and `y`
   *
   * @beta
   */
  set: (bin: string, key: string, value: unknown): void => {
    if (!data.has(bin)) {
      initBin(bin);
    }
    data.get(bin)?.set(key, value);
  },

  get: <T>(bin: string, key: string): T => data.get(bin)?.get(key),

  delete: (bin: string, key: string): boolean =>
    data.get(bin)?.delete(key) || false,

  count: (bin: string): number => data.get(bin)?.size || 0,

  reset: (bin: string): void => initBin(bin),
};

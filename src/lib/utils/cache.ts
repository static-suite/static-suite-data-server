const data = new Map<string, Map<string, any>>();

const initBin = (bin: string): void => {
  data.set(bin, new Map<string, any>());
};

export const cache = {
  set: (bin: string, key: string, value: unknown): void => {
    if (!data.has(bin)) {
      initBin(bin);
    }
    data.get(bin)?.set(key, value);
  },

  get: <T>(bin: string, key: string): T => data.get(bin)?.get(key),

  delete: (bin: string, key: string): boolean =>
    data.get(bin)?.delete(key) || false,

  countItems: (bin: string): number => data.get(bin)?.size || 0,

  reset: (bin: string): void => initBin(bin),
};

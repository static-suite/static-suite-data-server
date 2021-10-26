import { Store } from '@lib/store/store.types';

export type DataDirManager = {
  store: Store;
  loadDataDir(options?: { useCache: boolean }): void;
  updateDataDir(): void;
  getDataDirLastUpdate(): Date | null;
};

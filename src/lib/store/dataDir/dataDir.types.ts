import { Store } from '@lib/store';

export type DataDirManager = {
  store: Store;
  loadDataDir(options?: { useCache: boolean }): DataDirManager;
  updateDataDir(): DataDirManager;
  getDataDirLastUpdate(): Date | null;
};

import { Store } from '@lib/store/store.types';
import { FileType } from '@lib/utils/fsUtils';

export type PostProcessor = {
  processFile(
    dataDir: string,
    file: string,
    fileContent: FileType,
    store: Store,
  ): FileType;

  storeAdd(
    dataDir: string,
    file: string,
    fileContent: FileType,
    store: Store,
  ): void;

  storeRemove(file: string, store: Store): void;
};

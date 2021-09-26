import { config } from '../config';
import { FileType } from '../utils/fsUtils';
import { Store } from './store';
import { moduleHandler } from '../utils/moduleHandler';

type PostProcessorType = {
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

export const getPostProcessor = (): PostProcessorType | null =>
  config.postProcessor
    ? moduleHandler.get<PostProcessorType>(config.postProcessor)
    : null;

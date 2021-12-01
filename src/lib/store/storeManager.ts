// import path from 'path';
import { config } from '@lib/config';
import { getFileContent } from '@lib/utils/fs';
import { FileType } from '@lib/utils/fs/fs.types';
import { Json } from '@lib/utils/string/string.types';
import { cache } from '@lib/utils/cache';
import { StoreAddOptions, StoreManager } from './store.types';
import { hookManager } from './hook';
import { store } from '.';
import { includeParser } from './includeParser';

const fileCache = cache.bin<FileType>('file');

/**
 * Sets a file into the store, regardless of being already added or not.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
 * @param options - Configuration options.
 *
 * @returns Object with two properties, "raw" and "json".
 */
const setFileIntoStore = (
  relativeFilepath: string,
  options: StoreAddOptions = { readFileFromCache: false },
): FileType => {
  let fileContent = options.readFileFromCache
    ? fileCache.get(relativeFilepath)
    : undefined;
  if (!fileContent) {
    const absoluteFilePath = `${config.dataDir}/${relativeFilepath}`;
    fileContent = getFileContent(absoluteFilePath);
    fileCache.set(relativeFilepath, fileContent);
  }

  // Invoke "process file" hook.
  const hookModulesInfo = hookManager.getModuleGroupInfo();
  hookModulesInfo.forEach(hookInfo => {
    const hookModule = hookInfo.getModule();
    if (hookModule.onProcessFile) {
      fileContent = hookModule.onProcessFile({
        dataDir: config.dataDir,
        relativeFilepath,
        fileContent,
        store,
      });
    }
  });

  store.data.set(relativeFilepath, fileContent.json || fileContent.raw);

  return fileContent;
};

export const storeManager: StoreManager = {
  add: (
    relativeFilepath: string,
    options = { readFileFromCache: false },
  ): StoreManager => {
    const fileContent = setFileIntoStore(relativeFilepath, options);

    // Invoke "store add" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemAdd) {
        hookModule.onStoreItemAdd({
          dataDir: config.dataDir,
          relativeFilepath,
          fileContent,
          store,
        });
      }
    });

    return storeManager;
  },

  remove: (relativeFilepath: string): StoreManager => {
    // Delete file contents from cache.
    cache.bin<FileType>('file').delete(relativeFilepath);

    // Delete file contents from store.
    store.data.delete(relativeFilepath);

    // Invoke "store remove" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemRemove) {
        hookModule.onStoreItemRemove({
          dataDir: config.dataDir,
          relativeFilepath,
          store,
        });
      }
    });

    return storeManager;
  },

  update: (relativeFilepath: string): StoreManager => {
    const fileContent = setFileIntoStore(relativeFilepath, {
      readFileFromCache: false,
    });

    // Invoke "store update" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemUpdate) {
        hookModule.onStoreItemUpdate({
          dataDir: config.dataDir,
          relativeFilepath,
          fileContent,
          store,
        });
      }
    });

    return storeManager;
  },

  includeParse: (): StoreManager => {
    store.data.forEach((fileContent: Json) => {
      storeManager.includeParseFile(fileContent);
    });

    store.data.forEach((fileContent: Json) => {
      includeParser.dynamic.run(fileContent);
    });
    return storeManager;
  },

  includeParseFile: (fileContent: Json): StoreManager => {
    includeParser.static.run(fileContent);
    return storeManager;
  },
};

// import path from 'path';
import { config } from '@lib/config';
import { getFileContent } from '@lib/utils/fs';
import { FileType } from '@lib/utils/fs/fs.types';
import { cache } from '@lib/utils/cache';
import { StoreAddOptions, StoreManager } from './store.types';
import { hookManager } from './hook';
import { store } from '.';
import { includeParser } from './includeParser';
import { RunMode } from '../dataServer.types';

const fileCache = cache.bin<FileType>('file');

/**
 * Tells whether a watcher for hooks is enabled.
 *
 * @remarks
 * Files from data dir are not read again once data dir is loaded
 * during bootstrap, except when:
 * 1) A file is updated: only that file is read form data dir.
 * 2) A watcher detects a hook change: all files in data dir are read again.
 *
 * For the second case, we want to avoid having to actually read all
 * files from cache if they have not changed. To do so, there is a
 * file cache that caches the file raw contents. That cache uses a lot of
 * memory, and should only be enabled when run mode is DEV (hence, a watcher
 * is enabled) and a hook directory is defined.
 *
 * @returns True if hook watcher is enabled.
 */
export const isHookWatcherEnabled = (): boolean =>
  config.runMode === RunMode.DEV && !!config.hookDir;

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
  const hookWatcherEnabled = isHookWatcherEnabled();
  let fileContent =
    hookWatcherEnabled && options.readFileFromCache
      ? fileCache.get(relativeFilepath)
      : undefined;
  if (!fileContent) {
    const absoluteFilePath = `${config.dataDir}/${relativeFilepath}`;
    fileContent = getFileContent(absoluteFilePath);
    if (hookWatcherEnabled) {
      fileCache.set(relativeFilepath, fileContent);
    }
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
  const dataToStore = fileContent.json || fileContent.raw;
  if (fileContent.json) {
    // Check if the object already exists to make sure we don't break the reference
    const previousData = store.data.get(relativeFilepath);
    if (dataToStore && typeof dataToStore === 'object') {
      if (previousData) {
        // Delete all referenced object properties
        Object.keys(previousData).forEach(key => {
          delete previousData[key];
        });
        // hydrate new object properties into referenced object
        Object.keys(dataToStore).forEach(key => {
          previousData[key] = dataToStore[key];
        });
      }
      const uuid = dataToStore.data?.content?.uuid;
      const langcode = dataToStore.data?.content?.langcode?.value;
      if (uuid && langcode) {
        const langcodeMap =
          store.index.uuid.get(langcode) ||
          store.index.uuid.set(langcode, new Map<string, any>());
        langcodeMap.set(uuid, dataToStore);
      }
      const url = dataToStore.data?.content?.url?.path;
      if (url) {
        store.index.url.set(url, dataToStore);
      }
    }
  }
  store.data.set(relativeFilepath, dataToStore);

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
    if (isHookWatcherEnabled()) {
      // Delete file contents from cache.
      fileCache.delete(relativeFilepath);
    }

    // Delete file contents from store.
    const data = store.data.get(relativeFilepath);
    const uuid = data.data?.content?.uuid;
    const langcode = data.data?.content?.langcode?.value;
    store.index.url.get(langcode).delete(uuid);

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

  parseIncludes: (): StoreManager => {
    // Parses static includes.
    store.data.forEach(fileContent => {
      storeManager.parseSingleFileIncludes(fileContent);
    });

    // Parses dynamic includes.
    store.data.forEach(fileContent => {
      includeParser.dynamic(fileContent);
    });

    return storeManager;
  },

  parseSingleFileIncludes: (fileContent): StoreManager => {
    includeParser.static(fileContent);
    return storeManager;
  },

  get: (relativeFilepath: string) => {
    let data = store.data.get(relativeFilepath);
    if (!data) {
      const filecontent = getFileContent(
        `${config.dataDir}/${relativeFilepath}`,
      );
      data = filecontent.json || filecontent.raw;
    }
    return data;
  },
};

import { config } from '@lib/config';
import { getFileContent } from '@lib/utils/fs';
import { FileType } from '@lib/utils/fs/fs.types';
import { cache } from '@lib/utils/cache';
import { StoreAddOptions, StoreManager } from './store.types';
import { hookManager } from './hook';
import { store } from '.';
import { includeParser, includeIndex } from './include';
import { RunMode } from '../dataServer.types';
import { tracker } from './diff/tracker';

const fileCache = cache.bin<string>('file');

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
 * files from disk if they have not changed. To do so, there is a
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
  const absoluteFilePath = `${config.dataDir}/${relativeFilepath}`;
  let fileContent = getFileContent(absoluteFilePath, {
    readFileFromCache: options.readFileFromCache,
    isFileCacheEnabled: hookWatcherEnabled,
  });

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
        // Remove previous data from URL index.
        const url = previousData.data?.content?.url?.path;
        if (url) {
          store.index.url.delete(url);
        }

        // Remove previous data from UUID index.
        const uuid = previousData.data?.content?.uuid;
        const langcode = previousData.data?.content?.langcode?.value;
        if (uuid && langcode) {
          store.index.uuid.get(langcode)?.delete(uuid);
        }

        // Remove previous include data from includeIndex.
        includeIndex.remove(relativeFilepath, previousData);

        // Delete all referenced object properties
        Object.keys(previousData).forEach(key => {
          delete previousData[key];
        });
        // hydrate new object properties into referenced object
        Object.keys(dataToStore).forEach(key => {
          previousData[key] = dataToStore[key];
        });
      }

      // Add data to UUID index.
      const uuid = dataToStore.data?.content?.uuid;
      const langcode = dataToStore.data?.content?.langcode?.value;
      if (uuid && langcode) {
        const langcodeMap =
          store.index.uuid.get(langcode) ||
          store.index.uuid.set(langcode, new Map<string, any>()).get(langcode);
        langcodeMap.set(uuid, dataToStore);
      }

      // Add data to URL index.
      const url = dataToStore.data?.content?.url?.path;
      if (url) {
        store.index.url.set(url, dataToStore);
      }

      // Add data to include index.
      includeIndex.set(relativeFilepath, dataToStore);
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
    // Track down file before it changes.
    tracker.trackChangedFile(relativeFilepath);

    if (isHookWatcherEnabled()) {
      // Delete file contents from cache.
      fileCache.delete(`${config.dataDir}/${relativeFilepath}`);
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

    // Track down file after it changes.
    // tracker.trackChangedFile(relativeFilepath);

    return storeManager;
  },

  update: (relativeFilepath: string): StoreManager => {
    // Track down file before it changes.
    tracker.trackChangedFile(relativeFilepath);

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

    // Track down file after it changes.
    tracker.trackChangedFile(relativeFilepath);

    return storeManager;
  },

  parseIncludes: (): StoreManager => {
    // Parses static includes.
    store.data.forEach((fileContent, relativeFilepath) => {
      includeParser.static(relativeFilepath, fileContent);
    });

    // Parses dynamic includes.
    store.data.forEach(fileContent => {
      includeParser.dynamic(fileContent);
    });

    return storeManager;
  },

  parseSingleFileIncludes: (relativeFilepath, fileContent): StoreManager => {
    includeParser.static(relativeFilepath, fileContent);
    includeParser.dynamic(fileContent);
    return storeManager;
  },
};

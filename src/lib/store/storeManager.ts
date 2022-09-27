import { config } from '@lib/config';
import { getFileContent } from '@lib/utils/fs';
import { FileType } from '@lib/utils/fs/fs.types';
import { StoreManager } from './store.types';
import { hookManager } from './hook';
import { store, resetStore } from '.';
import { includeParser } from './include';
import { dependencyIncludeHelper } from './dependency/dependencyFileHelper';
import { dependencyTagger } from './dependency/dependencyTagger';

/**
 * Sets a file into the store, regardless of being already added or not.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
 * @param options - Configuration options.
 *
 * @returns Object with two properties, "raw" and "json".
 */
const setFileIntoStore = (relativeFilepath: string): FileType => {
  const absoluteFilePath = `${config.dataDir}/${relativeFilepath}`;
  let fileContent = getFileContent(absoluteFilePath);

  // Invoke "process file" hook.
  fileContent = hookManager.invokeOnProcessFile({
    relativeFilepath,
    fileContent,
  });

  const dataToStore = fileContent.json || fileContent.raw;
  if (fileContent.json) {
    // Check if the object already exists to make sure we don't break the reference
    const previousData = store.data.get(relativeFilepath);
    if (dataToStore && typeof dataToStore === 'object') {
      if (previousData) {
        // Delete include dependencies.
        dependencyIncludeHelper.deleteIncludeDependencies(
          relativeFilepath,
          dataToStore,
        );

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

      // Add include dependencies.
      dependencyIncludeHelper.setIncludeDependencies(
        relativeFilepath,
        dataToStore,
      );
    }
  }
  store.data.set(relativeFilepath, dataToStore);

  // Remove this path from store.deleted
  store.deleted.delete(relativeFilepath);

  return fileContent;
};

export const storeManager: StoreManager = {
  add: (relativeFilepath: string): StoreManager => {
    const fileContent = setFileIntoStore(relativeFilepath);

    // Invoke "store add" hook.
    hookManager.invokeOnStoreItemAdd({ relativeFilepath, fileContent });

    return storeManager;
  },

  update: (relativeFilepath: string): StoreManager => {
    const storedData = store.data.get(relativeFilepath);
    if (storedData) {
      hookManager.invokeOnStoreItemBeforeUpdate({
        relativeFilepath,
        fileContent: storedData,
      });
    }

    const fileContent = setFileIntoStore(relativeFilepath);

    // Invalidate this item.
    dependencyTagger.invalidateTags([relativeFilepath]);

    // Invoke "store update" hook.
    hookManager.invokeOnStoreItemAfterUpdate({
      relativeFilepath,
      fileContent,
    });

    return storeManager;
  },

  remove: (relativeFilepath: string): StoreManager => {
    // Get stored data before removing it from store.
    const storedData = store.data.get(relativeFilepath);

    // Remove data from URL index.
    const url = storedData.data?.content?.url?.path;
    if (url) {
      store.index.url.delete(url);
    }

    // Remove data from UUID index.
    const uuid = storedData.data?.content?.uuid;
    const langcode = storedData.data?.content?.langcode?.value;
    if (uuid && langcode) {
      store.index.uuid.get(langcode)?.delete(uuid);
    }

    // Delete file contents from store.
    store.data.delete(relativeFilepath);

    // Save its path in store.deleted for future reference.
    store.deleted.add(relativeFilepath);

    // Invalidate this item.
    dependencyTagger.invalidateTags([relativeFilepath]);

    // Invoke "store remove" hook.
    hookManager.invokeOnStoreItemDelete({
      relativeFilepath,
      fileContent: storedData,
    });

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

  reset: () => {
    resetStore();
    return storeManager;
  },
};

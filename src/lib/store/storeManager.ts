import { config } from '../config';
import { getFileContent } from '../utils/fs';
import { Json } from '../utils/object/object.types';
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
 *
 * @returns Object with two properties:
 *  fileContent: the contents of the stored file
 *  previousStoredData: the contents of the previously stored file
 */
const setFileIntoStore = (
  relativeFilepath: string,
): {
  fileContent: Json | string | null;
  previousStoredData: Json | null;
} => {
  const absoluteFilePath = `${config.dataDir}/${relativeFilepath}`;
  let fileContent = getFileContent(absoluteFilePath);

  // Invoke "process file" hook.
  fileContent = hookManager.invokeOnProcessFile({
    relativeFilepath,
    fileContent,
  });

  let previousStoredData: any = null;

  const dataToStore = fileContent.json || fileContent.raw;
  const currentData = store.data.get(relativeFilepath);
  let skipUpdating = false;
  if (fileContent.json) {
    // Check if the object already exists to make sure we don't break the reference
    if (dataToStore && typeof dataToStore === 'object') {
      if (currentData) {
        // Delete include dependencies.
        dependencyIncludeHelper.deleteIncludeDependencies(
          relativeFilepath,
          currentData,
        );

        // Remove previous data from URL index.
        const url = currentData.data?.content?.url?.path;
        if (url) {
          store.index.url.delete(url);
        }

        // Remove previous data from UUID index.
        const uuid = currentData.data?.content?.uuid;
        const langcode = currentData.data?.content?.langcode?.value;
        if (uuid && langcode) {
          store.index.uuid.get(langcode)?.delete(uuid);
        }

        // Delete all referenced object properties and copy them to another object.
        previousStoredData = currentData.data?.content
          ? { data: { content: {} } }
          : {};
        if (currentData.metadata) {
          // We cannot use structuredClone to clone the whole JSON,
          // since proxies used by queries are not supported by structuredClone.
          previousStoredData.metadata = structuredClone(currentData.metadata);
        }
        const previousStoredDataPointer =
          previousStoredData.data?.content || previousStoredData;
        const currentDataPointer = currentData.data?.content || currentData;
        Object.keys(currentDataPointer).forEach(key => {
          previousStoredDataPointer[key] = currentDataPointer[key];
          delete currentDataPointer[key];
        });

        // Hydrate new object properties into referenced object
        const dataToStorePointer = dataToStore.data?.content || dataToStore;
        Object.keys(dataToStorePointer).forEach(key => {
          currentDataPointer[key] = dataToStorePointer[key];
        });

        if (dataToStore.metadata) {
          currentData.metadata = dataToStore.metadata;
        } else {
          delete currentData.metadata;
        }

        skipUpdating = true;
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
      dependencyIncludeHelper.addIncludeDependencies(
        relativeFilepath,
        dataToStore,
      );
    }
  } else {
    previousStoredData = currentData;
  }

  if (!skipUpdating) {
    store.data.set(relativeFilepath, dataToStore);
  }

  // Remove this path from store.deleted
  store.deleted.delete(relativeFilepath);

  return { fileContent: dataToStore, previousStoredData };
};

export const storeManager: StoreManager = {
  add: (relativeFilepath: string): StoreManager => {
    const { fileContent } = setFileIntoStore(relativeFilepath);

    // Invoke "store add" hook.
    hookManager.invokeOnStoreItemAdd({
      relativeFilepath,
      storeItem: fileContent,
    });

    return storeManager;
  },

  update: (relativeFilepath: string): StoreManager => {
    const storedData = store.data.get(relativeFilepath);
    if (storedData) {
      hookManager.invokeOnStoreItemBeforeUpdate({
        relativeFilepath,
        storeItem: storedData,
      });
    }

    const { fileContent, previousStoredData } =
      setFileIntoStore(relativeFilepath);

    // Invalidate this item.
    dependencyTagger.invalidateTags([relativeFilepath]);

    // Invoke "store update" hook.
    hookManager.invokeOnStoreItemAfterUpdate({
      relativeFilepath,
      storeItem: fileContent,
      previousStoreItem: previousStoredData,
    });

    return storeManager;
  },

  remove: (relativeFilepath: string): StoreManager => {
    // Get stored data before removing it from store.
    const storedData = store.data.get(relativeFilepath);

    if (storedData) {
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
      storeItem: storedData,
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

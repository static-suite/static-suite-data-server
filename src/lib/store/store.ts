import path from 'path';
import { getFileContent } from '@lib/utils/fs';
import { getVariantKey } from '@lib/utils/string';
import { FileType, Json } from '@lib/utils/fs/fs.types';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { deepClone } from '@lib/utils/object';
import { Store } from './store.types';
import { hookManager } from './hook';

const JSON_ITEMS = '_json';
const MAIN = 'main';
const VARIANTS = 'variants';

type StoreDataLeaf = {
  [key: string]: Json | string | Array<any> | StoreDataLeaf;
  [JSON_ITEMS]: {
    [MAIN]: Json[];
    [VARIANTS]: {
      [key: string]: Json[];
    };
  };
};

const addFileToJsonItems = (
  dataLeaf: any,
  file: string,
  jsonFileContents: Json,
): void => {
  const leaf = dataLeaf;
  // Add __FILENAME__ to json so it can be found later.
  const json = jsonFileContents;
  json.__FILENAME__ = file;

  // Check whether file is a regular one or a variant
  const variantKey = getVariantKey(file);

  // Take variant into account.
  if (variantKey) {
    // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
    if (!leaf[JSON_ITEMS][VARIANTS][variantKey]) {
      leaf[JSON_ITEMS][VARIANTS][variantKey] = [];
    }
    leaf[JSON_ITEMS][VARIANTS][variantKey].push(json);
  } else {
    leaf[JSON_ITEMS][MAIN].push(json);
  }
};

const removeFileFromJsonItems = (
  dataLeaf: StoreDataLeaf,
  file: string,
): void => {
  const leaf = dataLeaf;

  // Check whether file is a regular one or a variant
  const variantKey = getVariantKey(file);

  // Take variant into account.
  if (variantKey) {
    // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
    if (leaf?.[JSON_ITEMS]?.[VARIANTS]?.[variantKey]) {
      const fileIndex = leaf[JSON_ITEMS][VARIANTS][variantKey].findIndex(
        item => item?.__FILENAME__ === file,
      );
      leaf[JSON_ITEMS][VARIANTS][variantKey].splice(fileIndex, 1);

      // Delete variant group if empty.
      if (leaf[JSON_ITEMS][VARIANTS][variantKey].length === 0) {
        delete leaf[JSON_ITEMS][VARIANTS][variantKey];
      }
    }
  } else if (leaf?.[JSON_ITEMS]?.[MAIN]) {
    const fileIndex = leaf[JSON_ITEMS][MAIN].findIndex(
      (item: Json) => item?.__FILENAME__ === file,
    );
    leaf[JSON_ITEMS][MAIN].splice(fileIndex, 1);
  }
};

// Tells whether pathParts meets required requirements
const meetsPathRequirements = (pathParts: string[]) => {
  // Check that path does not contain the reserved name JSON_ITEMS.
  if (pathParts?.includes(JSON_ITEMS)) {
    logger.warn(
      `Skipping file "${pathParts.join(
        '/',
      )}" since it contains "${JSON_ITEMS}", a reserved name. Please, rename it.`,
    );
    return false;
  }
  return true;
};

// A skeleton for the data in the store.
const storeDataSkeleton: StoreDataLeaf = {
  [JSON_ITEMS]: {
    [MAIN]: [],
    [VARIANTS]: {},
  },
};

export const store: Store = {
  syncDate: null,
  data: deepClone(storeDataSkeleton),
  stage: deepClone(storeDataSkeleton),
  add: (
    dataDir: string,
    file: string,
    options = { useStage: false, useCache: false },
  ): Store => {
    const pathParts = file.split('/');
    // Check that path meets requirements.
    if (!meetsPathRequirements(pathParts)) {
      return store;
    }

    const filePath = path.join(dataDir, file);
    if (!options.useCache || !cache.bin('file').get(filePath)) {
      cache.bin('file').set(filePath, getFileContent(filePath));
    }
    let fileContent: FileType = cache.bin('file').get(filePath);

    // Invoke "process file" hook.
    const hookModules = hookManager.getHookModules();
    hookModules.forEach(hookModule => {
      if (hookModule.processFile) {
        fileContent = hookModule.processFile(dataDir, file, fileContent, store);
      }
    });

    const rootLeaf = options.useStage ? store.stage : store.data;
    let leaf = rootLeaf;
    const pathPartsLength = pathParts.length;
    pathParts.forEach((part, index) => {
      // When processing the last part of the path (the filename), add its contents
      // to the object, with the filename as a property.
      const isFilenamePart = pathPartsLength === index + 1;
      if (isFilenamePart) {
        const leafFileContent = fileContent.json || fileContent.raw;
        if (leafFileContent) {
          leaf[part] = leafFileContent;
          // Add data to root JSON_ITEMS
          if (fileContent.json) {
            addFileToJsonItems(rootLeaf, file, fileContent.json);
          }
        }
      } else {
        // If it's a directory, create structure and add to JSON_ITEMS.
        // Ensure leaf[part] is an object with MAIN and VARIANTS. This must
        // be done here, to ensure proper structure is created, even when we
        // find a directory with only one non-JSON_ITEMS file.
        if (!leaf[part]) {
          leaf[part] = deepClone(storeDataSkeleton);
        }

        // Add data to leaf JSON_ITEMS
        if (fileContent.json) {
          addFileToJsonItems(leaf[part], file, fileContent.json);
        }

        // Step into next leaf.
        if (leaf[part]) {
          leaf = leaf[part];
        }
      }
    });

    // Invoke "store add" hook.
    hookModules.forEach(hookModule => {
      if (hookModule.storeAdd) {
        hookModule.storeAdd(dataDir, file, fileContent, store);
      }
    });

    return store;
  },

  remove: (file: string): Store => {
    const pathParts = file.split('/');

    let leaf = store.data;
    const pathPartsLength = pathParts.length;
    pathParts.forEach((part, index) => {
      // When processing the last part of the path (the filename), add its contents
      // to the object, with a property which is the filename.
      const isFilenamePart = pathPartsLength === index + 1;
      if (isFilenamePart) {
        delete leaf[part];
        removeFileFromJsonItems(store.data, file);
      } else {
        removeFileFromJsonItems(leaf[part], file);
      }

      // Step into next leaf.
      if (leaf[part]) {
        leaf = leaf[part];
      }
    });

    // Invoke "store remove" hook.
    const hookModules = hookManager.getHookModules();
    hookModules.forEach(hookModule => {
      if (hookModule.storeRemove) {
        hookModule.storeRemove(file, store);
      }
    });

    return store;
  },

  update: (dataDir: string, file: string): Store => {
    store.remove(file);
    store.add(dataDir, file);
    return store;
  },

  promoteStage: () => {
    store.data = store.stage;
    store.stage = deepClone(storeDataSkeleton);
    return store;
  },
};

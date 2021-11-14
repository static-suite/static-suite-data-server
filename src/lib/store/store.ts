import path from 'path';
import { config } from '@lib/config';
import { getFileContent } from '@lib/utils/fs';
import { getVariantKey } from '@lib/utils/string';
import { FileType } from '@lib/utils/fs/fs.types';
import { Json } from '@lib/utils/string/string.types';
import { logger } from '@lib/utils/logger';
import { cache } from '@lib/utils/cache';
import { deepClone } from '@lib/utils/object';
import { StoreDataLeaf, Store } from './store.types';
import { JSON_ITEMS, MAIN, VARIANTS } from './store.constants';
import { hookManager } from './hook';

/**
 * Add a file to JSON items inside a data lead.
 *
 * @param dataLeaf - Data lead to act on.
 * @param relativeFilePath - Relative file path to be removed.
 * @param jsonFileContents - JSON contents to be added.
 */
const addFileToJsonItems = (
  dataLeaf: any,
  relativeFilePath: string,
  jsonFileContents: Json,
): void => {
  const leaf = dataLeaf;
  // Add __FILENAME__ to json so it can be found later.
  const json = jsonFileContents;
  json.__FILENAME__ = relativeFilePath;

  // Check whether file is a regular one or a variant
  const variantKey = getVariantKey(relativeFilePath);

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

/**
 * Removes a file from JSON items inside a data lead.
 *
 * @param dataLeaf - Data lead to act on.
 * @param relativeFilePath - Relative file path to be removed.
 */
const removeFileFromJsonItems = (
  dataLeaf: StoreDataLeaf,
  relativeFilePath: string,
): void => {
  const leaf = dataLeaf;

  // Check whether file is a regular one or a variant
  const variantKey = getVariantKey(relativeFilePath);

  // Take variant into account.
  if (variantKey) {
    // Ensure JSON_ITEMS.VARIANTS.variantKey is an array
    if (leaf?.[JSON_ITEMS]?.[VARIANTS]?.[variantKey]) {
      const fileIndex = leaf[JSON_ITEMS][VARIANTS][variantKey].findIndex(
        item => item?.__FILENAME__ === relativeFilePath,
      );
      leaf[JSON_ITEMS][VARIANTS][variantKey].splice(fileIndex, 1);

      // Delete variant group if empty.
      if (leaf[JSON_ITEMS][VARIANTS][variantKey].length === 0) {
        delete leaf[JSON_ITEMS][VARIANTS][variantKey];
      }
    }
  } else if (leaf?.[JSON_ITEMS]?.[MAIN]) {
    const fileIndex = leaf[JSON_ITEMS][MAIN].findIndex(
      (item: Json) => item?.__FILENAME__ === relativeFilePath,
    );
    leaf[JSON_ITEMS][MAIN].splice(fileIndex, 1);
  }
};

/**
 * Tells whether pathParts meets required requirements
 *
 * @param pathParts - An array with the parts of a file path.
 *
 * @returns True if requirements are met, false otherwise.
 */
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

/**
 * An skeleton for the data in the store.
 *
 * @remarks
 * It must be deep cloned to avoid using the same object instead of a new one.
 * */
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
    relativeFilepath: string,
    options = { useStage: false, useCache: false },
  ): Store => {
    const pathParts = relativeFilepath.split('/');
    // Check that path meets requirements.
    if (!meetsPathRequirements(pathParts)) {
      return store;
    }

    const filePath = path.join(config.dataDir, relativeFilepath);
    if (!options.useCache || !cache.bin('file').get(filePath)) {
      cache.bin<FileType>('file').set(filePath, getFileContent(filePath));
    }
    // Using "as FileType" because we are sure that it will not return undefined,
    // since its value has been set by ourselves.
    let fileContent = cache.bin<FileType>('file').get(filePath) as FileType;

    // Invoke "process file" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.processFile) {
        fileContent = hookModule.processFile({
          dataDir: config.dataDir,
          relativeFilepath,
          fileContent,
          store,
        });
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
            addFileToJsonItems(rootLeaf, relativeFilepath, fileContent.json);
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
          addFileToJsonItems(leaf[part], relativeFilepath, fileContent.json);
        }

        // Step into next leaf.
        if (leaf[part]) {
          leaf = leaf[part];
        }
      }
    });

    // Invoke "store add" hook.
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.storeAdd) {
        hookModule.storeAdd({
          dataDir: config.dataDir,
          relativeFilepath,
          fileContent,
          store,
        });
      }
    });

    return store;
  },

  remove: (relativeFilepath: string): Store => {
    const pathParts = relativeFilepath.split('/');

    let leaf = store.data;
    const pathPartsLength = pathParts.length;
    pathParts.forEach((part, index) => {
      // When processing the last part of the path (the filename), add its contents
      // to the object, with a property which is the filename.
      const isFilenamePart = pathPartsLength === index + 1;
      if (isFilenamePart) {
        delete leaf[part];
        removeFileFromJsonItems(store.data, relativeFilepath);
      } else {
        removeFileFromJsonItems(leaf[part], relativeFilepath);
      }

      // Step into next leaf.
      if (leaf[part]) {
        leaf = leaf[part];
      }
    });

    // Invoke "store remove" hook.
    const hookModulesInfo = hookManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.storeRemove) {
        hookModule.storeRemove({
          dataDir: config.dataDir,
          relativeFilepath,
          store,
        });
      }
    });

    return store;
  },

  update: (relativeFilepath: string): Store => {
    store.remove(relativeFilepath);
    store.add(relativeFilepath);
    return store;
  },

  promoteStage: () => {
    store.data = store.stage;
    store.stage = deepClone(storeDataSkeleton);
    return store;
  },
};

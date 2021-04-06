const path = require('path');
const { config } = require('../config');
const { moduleHandler } = require('../utils/moduleHandler');
const { getFileContents, getVariantName } = require('../utils/fsUtils');
const { logger } = require('../utils/logger');

const ITEMS = '_items';
const MAIN = 'main';
const VARIANTS = 'variants';

const fileContentCache = {};

const deepClone = object => JSON.parse(JSON.stringify(object));

const addFileToItems = (dataLeaf, file, jsonFileContents) => {
  if (jsonFileContents) {
    const leaf = dataLeaf;

    // Add __FILENAME__ to json so it can be later found.
    const json = jsonFileContents;
    json.__FILENAME__ = file;

    // Check whether file is a regular one or a variant
    const variantName = getVariantName(file);

    // Take variant into account.
    if (variantName) {
      // Ensure ITEMS.VARIANTS.variantName is an array
      if (!leaf[ITEMS][VARIANTS][variantName]) {
        leaf[ITEMS][VARIANTS][variantName] = [];
      }
      leaf[ITEMS][VARIANTS][variantName].push(json);
    } else {
      leaf[ITEMS][MAIN].push(json);
    }
  }
};

const removeFileFromItems = (dataLeaf, file) => {
  const leaf = dataLeaf;

  // Check whether file is a regular one or a variant
  const variantName = getVariantName(file);

  // Take variant into account.
  if (variantName) {
    // Ensure ITEMS.VARIANTS.variantName is an array
    if (leaf?.[ITEMS]?.[VARIANTS]?.[variantName]) {
      const fileIndex = leaf[ITEMS][VARIANTS][variantName].findIndex(
        item => item?.__FILENAME__ === file,
      );
      leaf[ITEMS][VARIANTS][variantName].splice(fileIndex, 1);

      // Delete variant group if empty.
      if (leaf[ITEMS][VARIANTS][variantName].length === 0) {
        delete leaf[ITEMS][VARIANTS][variantName];
      }
    }
  } else if (leaf?.[ITEMS]?.[MAIN]) {
    const fileIndex = leaf[ITEMS][MAIN].findIndex(
      item => item?.__FILENAME__ === file,
    );
    leaf[ITEMS][MAIN].splice(fileIndex, 1);
  }
};

// Tells whether pathParts meets required requirements
const meetsPathRequirements = pathParts => {
  // Check that path does not contain the reserved name ITEMS.
  if (pathParts?.includes(ITEMS)) {
    logger.warn(
      `Skipping file "${pathParts.join(
        '/',
      )}" since it contains "${ITEMS}", a reserved name. Please, rename it.`,
    );
    return false;
  }
  return true;
};

const getPostProcessor = () =>
  config.postProcessor ? moduleHandler.get(config.postProcessor) : null;

// A skeleton for the data in the store.
const storeDataSkeleton = {
  [ITEMS]: {
    [MAIN]: [],
    [VARIANTS]: {},
  },
};

/**
 * @typedef {Object} Store
 * @property {Date} updated - Date to tell when was the store last updated.
 * @property {Object} data - Object that holds all data.
 * @property {Function} add - Add a file to the store
 * @property {Function} remove - Remove a file from the store
 */
const store = {
  /**
   * Date to tell when was the store last updated.
   */
  updated: undefined,

  /**
   * Object that holds all data for all path files.
   *
   * Every directory path contains an special entry named "_items", which is an
   * object that contains "main" and "variants":
   *  - "main":     an array that contains, recursively, all files inside that directory
   *                that are not a variant.
   *  - "variants": an object keyed with available variants, that contains, recursively,
   *                all variants inside that directory.
   *
   * @example
   * // Find articles that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._items.main.filter(
   *    article => article.data.content.title.indexOf('foo') !== 1
   * );
   *
   * @example
   * // Find "teaser" article variants that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._items.variant.teaser.filter(
   *    article => article.data.content.title.indexOf('foo') !== 1
   * );
   */
  data: deepClone(storeDataSkeleton),

  /**
   * Temporary object to be able to make changes to data without touching "store.data".
   */
  stage: deepClone(storeDataSkeleton),

  /**
   * Add a file to the store, into a tree structure.
   *
   * Each file is stored in a tree-like object, where directories and filenames
   * are transformed into object properties. For example, the filepath
   * "/en/entity/node/article/40000/41234.json" is transformed into:
   * store.data.en.entity.node.article['40000']['41234.json']
   *
   * Every JSON file is also added to a special "_items" object inside every
   * tree leaf, so the above file will be available in:
   * store.data._items.main
   * store.data.en._items.main
   * store.data.en.entity._items.main
   * store.data.en.entity.node._items.main
   * store.data.en.entity.node.article._items.main
   * store.data.en.entity.node.article['40000']._items.main
   *
   * Given a variant file named "/en/entity/node/article/40000/41234--teaser.json",
   * it would be added to the following "_items" object:
   * store.data._items.variants.teaser
   * store.data.en._items.variants.teaser
   * store.data.en.entity._items.variants.teaser
   * store.data.en.entity.node._items.variants.teaser
   * store.data.en.entity.node.article._items.variants.teaser
   * store.data.en.entity.node.article['40000']._items.variants.teaser
   *
   * This way, queries can be run on any set of data, limiting the amount of data to by analyzed.
   *
   * Each "_items" contains all files inside that level, recursively.
   * For example:
   * - "store.data._items" contains all files in the store
   * - "store.data.en.entity.node.article._items" contains all articles in the store
   *
   * @param {string} dataDir - Absolute path to the data directory where files are stored.
   * @param {string} file - Relative path to the file to be added.
   * @param {Object} options Configuration options
   * @param {boolean} options.useStage - Add data to a temporary "store.stage" that will later replace "store.data".
   * @param {boolean} options.useCache - Obtain data from cache.
   *
   * @returns {Store} store - The store object, to allow chaining.
   */
  add: (dataDir, file, options = {}) => {
    if (!file) {
      return store;
    }

    const pathParts = file.split('/');
    // Check that path meets requirements.
    if (!meetsPathRequirements(pathParts)) {
      return store;
    }

    const filePath = path.join(dataDir, file);
    let rawFileContents;
    let jsonFileContents;
    if (!options.useCache || !fileContentCache[filePath]) {
      fileContentCache[filePath] = getFileContents(filePath);
    }
    ({ raw: rawFileContents, json: jsonFileContents } = fileContentCache[
      filePath
    ]);

    // Post process file.
    const postProcessor = getPostProcessor();
    if (postProcessor?.processFile) {
      ({ rawFileContents, jsonFileContents } = postProcessor.processFile({
        dataDir,
        file,
        rawFileContents,
        jsonFileContents,
        store,
      }));
    }

    const rootLeaf = options.useStage ? store.stage : store.data;
    let leaf = rootLeaf;
    const pathPartsLength = pathParts.length;
    pathParts.forEach((part, index) => {
      // When processing the last part of the path (the filename), add its contents
      // to the object, with the filename as a property.
      const isFilenamePart = pathPartsLength === index + 1;
      if (isFilenamePart) {
        leaf[part] = jsonFileContents || rawFileContents;

        // Add data to root ITEMS
        addFileToItems(rootLeaf, file, jsonFileContents);
      } else {
        // If it's a directory, create structure and add to ITEMS.
        // Ensure leaf[part] is an object with MAIN and VARIANTS. This must
        // be done here, to ensure proper structure is created, even when we
        // find a directory with only one non-JSON file.
        if (!leaf[part]) {
          leaf[part] = deepClone(storeDataSkeleton);
        }

        // Add data to leaf ITEMS
        addFileToItems(leaf[part], file, jsonFileContents);

        // Step into next leaf.
        if (leaf[part]) {
          leaf = leaf[part];
        }
      }
    });

    // Post process file.
    if (postProcessor?.storeAdd) {
      postProcessor.storeAdd({
        dataDir,
        file,
        rawFileContents,
        jsonFileContents,
        store,
      });
    }

    return store;
  },

  /**
   * Remove a file from the store.
   *
   * It removes the object and all its references across the tree structure.
   *
   * @param {string} file - Relative path to the file to be removed.
   *
   * @returns {Store} store - The store object, to allow chaining.
   */
  remove: file => {
    const pathParts = file.split('/');

    let leaf = store.data;
    const pathPartsLength = pathParts.length;
    pathParts.forEach((part, index) => {
      // When processing the last part of the path (the filename), add its contents
      // to the object, with a property which is the filename.
      const isFilenamePart = pathPartsLength === index + 1;
      if (isFilenamePart) {
        delete leaf[part];
        removeFileFromItems(store.data, file);
      } else {
        removeFileFromItems(leaf[part], file);
      }

      // Step into next leaf.
      if (leaf[part]) {
        leaf = leaf[part];
      }
    });

    // Post process file.
    const postProcessor = getPostProcessor();
    if (postProcessor?.storeRemove) {
      postProcessor.storeRemove({ file, store });
    }

    return store;
  },

  /**
   * Updates a file from the store.
   *
   * It removes the object and all its references across the tree structure, and
   * adds it again to the structure.
   *
   * @param {string} dataDir - Absolute path to the data directory where files are stored.
   * @param {string} file - Relative path to the file to be updated.
   *
   * @returns {Store} store - The store object, to allow chaining.
   */
  update: (dataDir, file) => {
    store.remove(file);
    store.add(dataDir, file);
    return store;
  },

  /**
   * Promotes data stored in "store.stage" to "store.data".
   *
   * @returns {Store} store - The store object, to allow chaining.
   */
  promoteStage: () => {
    store.data = store.stage;
    store.stage = deepClone(storeDataSkeleton);
    return store;
  },
};

module.exports.store = store;

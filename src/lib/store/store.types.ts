import { Json } from '@lib/utils/string/string.types';
import { JSON_ITEMS, MAIN, VARIANTS } from './store.constants';

/**
 * The structure of a leaf inside the data store.
 */
export type StoreDataLeaf = {
  /**
   * An object containing any kind of data inside: other leafs, JSON items, strings, arrays, etc
   */
  [key: string]: Json | string | Array<any> | StoreDataLeaf;

  /**
   * An object containing JSON items, grouped by main or variant key.
   */
  [JSON_ITEMS]: {
    /**
     * An array of main JSON items.
     */
    [MAIN]: Json[];
    /**
     * An object containing all of variant JSON items, keyed by variant key.
     */
    [VARIANTS]: {
      /**
       * An array of variant JSON items, keyed by variant key.
       */
      [key: string]: Json[];
    };
  };
};

/**
 * Options for the store.add() function. @see {@link Store#add}
 */
export type StoreAddOptions = {
  /**
   * Flag to add data to a temporary "store.stage" that will later replace "store.data".
   */
  useStage: boolean;

  /**
   * Flag to obtain file data from cache instead of the file system.
   */
  useCache: boolean;
};

/**
 * The manager that handles the store data.
 */
export type Store = {
  /**
   * Date to tell when was the store last synced.
   *
   * Every time the store is updated, syncDate is set with the last modification
   * date of the data directory, not the date when the store haa finished updating.
   *
   * Given this scenario:
   * - Data directory modified at 12:30:00
   * - Syncing the store takes 3 seconds and finishes at 12:30:03
   *
   * ...syncDate will be 12:30:00, not 12:30:03.
   *
   * Doing it the other way round can cause data inconsistencies, because syncing files
   * to the store takes time, it is done sequentially, and in the meanwhile, other
   * modifications can happen:
   * - Store last syncDate is 12:29:00
   * - Data directory is modified at 12:30:00
   * - We ask for modified files after 12:29:00 and got 3 files (1.json, 2.json and 3.json)
   * - File "1.json" is processed and added to the store at 12:30:01
   * - While "2.json" is being processed and added to the store, data directory is modified
   * again at 12:30:02 and "1.json" is changed.
   * - File "3.json" is processed and added to the store at 12:30:03
   *
   * At this moment, there are two options:
   *
   * 1) Setting syncDate to the current date:
   * - Store syncDate is set to 12:30:03
   * - Data directory is modified again at 12:30:10 and only "3.json" is changed
   * - We ask for modified files after 12:30:03 and get only "3.json"
   * - Modification done at 12:30:02 to "1.json" is lost and cannot be recovered unless "1.json" is
   * modified again, or Data Server is restarted
   *
   * 2) Setting syncDate to the last modification date of the data directory:
   * - Store syncDate is set to 12:30:00
   * - Data directory is modified again at 12:30:10 and only "3.json" is changed
   * - We ask for modified files after 12:30:00 and get "1.json" and "3.json"
   * - Modification done at 12:30:02 to "1.json" is properly processed
   */
  syncDate: Date | null;

  /**
   * Object that holds all data for all path files.
   *
   * @remarks
   * Every directory path contains an special entry named "_json", which is an
   * object that contains "main" and "variants":
   *  - "main":     an array that contains, recursively, all files inside that directory
   *                that are not a variant.
   *  - "variants": an object keyed with available variants, that contains, recursively,
   *                all variants inside that directory.
   *
   * @example
   * ```
   * // Find articles that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._json.main.filter(
   *    article =\> article.data.content.title.indexOf('foo') !== 1
   * );
   * ```
   *
   * @example
   * ```
   * // Find "teaser" article variants that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._json.variant.teaser.filter(
   *    article =\> article.data.content.title.indexOf('foo') !== 1
   * );
   * ```
   */
  data: any;

  /**
   * Temporary object aimed at making changes to data without touching "store.data".
   */
  stage: any;

  /**
   * Adds a file to the store, into a tree structure.
   *
   * @remarks
   * Each file is stored in a tree-like object, where directories and filenames
   * are transformed into object properties. For example, the filepath
   * "/en/entity/node/article/40000/41234.json" is transformed into:
   * store.data.en.entity.node.article['40000']['41234.json']
   *
   * Every JSON file is also added to a special "_json" object inside every
   * tree leaf, so the above file will be available in:
   * store.data._json.main
   * store.data.en._json.main
   * store.data.en.entity._json.main
   * store.data.en.entity.node._json.main
   * store.data.en.entity.node.article._json.main
   * store.data.en.entity.node.article['40000']._json.main
   *
   * Given a variant file named "/en/entity/node/article/40000/41234--teaser.json",
   * it would be added to the following "_json" object:
   * store.data._json.variants.teaser
   * store.data.en._json.variants.teaser
   * store.data.en.entity._json.variants.teaser
   * store.data.en.entity.node._json.variants.teaser
   * store.data.en.entity.node.article._json.variants.teaser
   * store.data.en.entity.node.article['40000']._json.variants.teaser
   *
   * This way, queries can be run on any set of data, limiting the amount of data to by analyzed.
   *
   * Each "_json" contains all files inside that level, recursively.
   * For example:
   * - "store.data._json" contains all files in the store
   * - "store.data.en.entity.node.article._json" contains all articles in the store
   *
   * It invokes "process file" and "store add" hooks.
   *
   * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
   * @param options - Configuration options.
   *
   * @returns The store object, to allow chaining.
   */
  add(relativeFilepath: string, options?: StoreAddOptions): Store;

  /**
   * Removes a file from the store.
   *
   * @remarks
   * It removes the object and all its references across the tree structure.
   * It invokes the "store remove" hook.
   *
   * @param file - Relative path to the file to be removed.
   *
   * @returns The store object, to allow chaining.
   */
  remove(file: string): Store;

  /**
   * Updates a file from the store.
   *
   * @remarks
   * It removes the object and all its references across the tree structure, and
   * adds it again to the structure.
   *
   * @param dataDir - Path to the data directory where files are stored.
   * @param file - Relative path, inside dataDir, to the file to be updated.
   *
   * @returns The store object, to allow chaining.
   */
  update(dataDir: string, file: string): Store;

  /**
   * Promotes data stored in "store.stage" to "store.data".
   *
   * @returns The store object, to allow chaining.
   */
  promoteStage(): Store;
};

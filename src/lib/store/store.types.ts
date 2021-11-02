export type Store = {
  /**
   * Date to tell when was the store last updated.
   *
   * Every time the store is updated, syncDate is set with the last modification
   * date of the data directory, not the current Date when we finish updating the
   * store.
   *
   * Given this scenario:
   * - Data directory modified at 12:30:00
   * - Syncing the store takes 3 seconds and finishes at 12:30:05
   *
   * ...syncDate will contain 12:30:00, not 12:30:03.
   *
   * Doing it the other way round can cause data inconsistencies, because syncing files
   * to the store takes time and it is done sequentially:
   * - Store last syncDate is 12:29:00
   * - Data directory is modified at 12:30:00
   * - We ask for modified files after 12:29:00 and get 3 files (1.json, 2.json and 3.json)
   * - File "1.json" is processed and added to the store at 12:30:01
   * - While "2.json" is being processed and added to the store, data directory is modified
   * again at 12:30:02 and "1.json" is changed.
   * - File "3.json" is processed and added to the store at 12:30:03
   *
   * At this moment, there are two options:
   *
   * 1) Setting syncDate to the current date:
   * - Store syncDate is set as 12:30:03
   * - Data directory is modified again at 12:30:10 and only "3.json" is changed
   * - We ask for modified files after 12:30:03 and get only "3.json"
   * - Modification done at 12:30:02 to "1.json" is lost and cannot be recovered unless "1.json" is
   * modified again, or Data Server is restarted
   *
   * 2) Setting syncDate to the last modification date of the data directory:
   * - Store syncDate is set as 12:30:00
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
   * // Find articles that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._json.main.filter(
   *    article => article.data.content.title.indexOf('foo') !== 1
   * );
   *
   * @example
   * // Find "teaser" article variants that contain "foo" inside their title.
   * const results = store.data.en.entity.node.article._json.variant.teaser.filter(
   *    article => article.data.content.title.indexOf('foo') !== 1
   * );
   */
  data: any;

  /**
   * Temporary object to be able to make changes to data without touching "store.data".
   */
  stage: any;

  /**
   * Add a file to the store, into a tree structure.
   *
   * @remarks
   * Each file is stored in a tree-like object, where directories and filenames
   * are transformed into object properties. For example, the filepath
   * "/en/entity/node/article/40000/41234.json" is transformed into:
   * store.data.en.entity.node.article['40000']['41234.json']
   *
   * Every JSON_ITEMS file is also added to a special "_json" object inside every
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
   * @param dataDir - Relative path to the data directory where files are stored.
   * @param file - Relative path to the file to be added.
   * @param {Object} options Configuration options
   * @param {boolean} options.useStage - Add data to a temporary "store.stage" that will later replace "store.data".
   * @param {boolean} options.useCache - Obtain data from cache.
   *
   * @returns The store object, to allow chaining.
   */
  add(
    dataDir: string,
    file: string,
    options?: {
      useStage: boolean;
      useCache: boolean;
    },
  ): Store;
  remove(file: string): Store;
  update(dataDir: string, file: string): Store;
  promoteStage(): Store;
};

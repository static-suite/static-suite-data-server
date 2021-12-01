import { Json } from '@lib/utils/string/string.types';
/**
 * Options for the store.add() function. @see {@link StoreManager#add}
 */
export declare type StoreAddOptions = {
    /**
     * Flag to obtain file data from cache instead of the file system.
     */
    readFileFromCache: boolean;
};
/**
 * The store that holds all data.
 */
export declare type Store = {
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
     * ... syncDate will be 12:30:00, not 12:30:03.
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
     * Map that holds all data for all files.
     *
     * @remarks
     * This map contains files, keyed by their relative filepath. No directory or
     * any other structure is stored here.
     *
     * When executing a query, a common pattern is to create a subset of this
     * map (e.g.- to get all articles of an specific language) and the execute the
     * query against that subset. To do so, see {@link Store#subset}
     *
     * @example
     * ```
     * // Find an specific article.
     * const article = store.data.get('en/entity/node/article/123.json');
     * const article = store.index.url.get('science/embvrosadas/sdaasd');
     * const article = store.index.custom.get('taxonomies').get('12234');
     *
     * // Create a subset of all english articles.
     * const results = store.data.subset({ dir: 'en/entity/node/article/', recursive: true });
     * ```
     */
    data: Map<string, any>;
    /**
     * An object to hold accessory index data.
     */
    index: {
        /**
         * An index that holds all data for all files, keyed by their URL.
         */
        url: Map<string, any>;
        /**
         * An index to hold custom data defined in hooks or queries.
         */
        custom: Map<string, any>;
    };
    /**
     * Create a subset with all files in store that match the given arguments.
     *
     * @remarks
     * All subsets are automatically cached, so passing the same arguments
     * will return the same subset from the cache.
     *
     * This is the preferred way of getting a subset of the store files,
     * since is a simple function that most of the times only requires
     * the first argument.
     *
     * @example
     * ```
     * // Get a subset of all nodes with "json" extension.
     * dataServer.store.subset({ dir: 'en/entity/node/', variant: null });
     *
     * // Get a subset of all articles in all languages with "json" extension.
     * dataServer.store.subset({ dir: '.+/entity/node/article/' });
     *
     * // Get a subset of all articles regardless of their extension.
     * dataServer.store.subset({ dir: 'en/entity/node/article/', ext: null });
     *
     * // Get a subset of all card variants for articles with "json" extension.
     * dataServer.store.subset({ dir: 'en/entity/node/article/', variant: null });
     *
     * // Get a subset of english articles, with "yml" extension, non-recursively.
     * dataServer.store.subset({ dir: 'en/entity/node/article/', ext: 'yml', recursive: false });
     * ```
     *
     * @param options - Object with options for creating a store subset.
     *
     * @returns An object with "filenames" and "items".
     */
    subset(options: StoreSubsetOptions): StoreSubset;
};
/**
 * Options for subset() function.
 */
export declare type StoreSubsetOptions = {
    /**
     * Optional base directory to filter files.
     *
     * @remarks
     * It requires a trailing slash, but not a leading slash, e.g.- "en/entity/node/article/"
     */
    dir?: string;
    /**
     * Optional name of a variant file.
     *
     * @remarks
     * Use '_main' to obtain the default variant.
     * Use any other string, e.g.- 'card', to obtain the card variant.
     * Use null to avoid searching for any variant.
     * Defaults to '_main'.
     */
    variant?: string;
    /**
     * Optional file extension, without dots. Defaults to 'json'.
     */
    ext?: string;
    /**
     * Optional flag to search for files recursively. True by default.
     */
    recursive?: boolean;
};
/**
 * Object holding a subset of items from the store.
 */
export declare type StoreSubset = {
    /**
     * Array of filenames in this subset.
     */
    filenames: Array<string>;
    /**
     * Array of items in this subset.
     */
    items: Array<any>;
};
/**
 * The manager that handles the store data.
 */
export declare type StoreManager = {
    /**
     * Adds a file to the store, into a Map structure keyed by its relative filepath.
     *
     * @remarks
     * It invokes "process file" and "store add" hooks.
     *
     * @param relativeFilepath - Relative file path, inside dataDir, to the file to be added.
     * @param options - Configuration options.
     *
     * @returns The store manager, to allow chaining.
     */
    add(relativeFilepath: string, options?: StoreAddOptions): StoreManager;
    /**
     * Removes a file from the store.
     *
     * @remarks
     * It removes the file from the map structure.
     * It invokes the "store remove" hook.
     *
     * @param file - Relative path to the file to be removed.
     *
     * @returns The store manager, to allow chaining.
     */
    remove(file: string): StoreManager;
    /**
     * Updates a file from the store.
     *
     * @remarks
     * It removes the file from the map structure, and adds it again.
     *
     * @param file - Relative path, inside dataDir, to the file to be updated.
     *
     * @returns The store manager, to allow chaining.
     */
    update(file: string): StoreManager;
    /**
     * Parses all static includes (entity, config, locale and custom) from data stored in "store.data".
     *
     * @returns The store manager, to allow chaining.
     */
    includeParse(): StoreManager;
    /**
     * Parses all static includes (entity, config, locale and custom) from one file.
     *
     * @param json - A JSON object.
     *
     * @returns The store manager, to allow chaining.
     */
    includeParseFile(json: Json): StoreManager;
};
//# sourceMappingURL=store.types.d.ts.map
export interface StoreData<K, V> extends Map<K, V> {
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
     * dataServer.store.data.subset({ dir: 'en/entity/node/', variant: null });
     *
     * // Get a subset of all articles in all languages with "json" extension.
     * dataServer.store.data.subset({ dir: '.+/entity/node/article/' });
     *
     * // Get a subset of all articles regardless of their extension.
     * dataServer.store.data.subset({ dir: 'en/entity/node/article/', ext: null });
     *
     * // Get a subset of all card variants for articles with "json" extension.
     * dataServer.store.data.subset({ dir: 'en/entity/node/article/', variant: null });
     *
     * // Get a subset of english articles, with "yml" extension, non-recursively.
     * dataServer.store.data.subset({ dir: 'en/entity/node/article/', ext: 'yml', recursive: false });
     * ```
     *
     * @param options - Object with options for creating a store subset.
     *
     * @returns An object with "filenames" and "items".
     */
    subset(options: StoreSubsetOptions): StoreSubset;
}
/**
 * The store that holds all data.
 */
export declare type Store = {
    /**
     * Current unique id to tell when was the store last synced.
     *
     * Every time the store is updated, uniqueId is set with the last modification
     * unique id of the data directory, not the date when the store has finished updating.
     *
     */
    uniqueId: string;
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
     * const article = store.index.url.get('public/pretty/url');
     * const article = store.index.uuid.get('nl').get('ce736c8b-a6ea-43c4-9a6b-ad1fc498017c');
     * const article = store.index.custom.get('taxonomies').get('12234');
     *
     * // Create a subset of all english articles.
     * const results = store.data.subset({ dir: 'en/entity/node/article/', recursive: true });
     * ```
     */
    data: StoreData<string, any>;
    /**
     * A list of deleted files from store, to be able to track them.
     */
    deleted: Set<string>;
    /**
     * An object to hold accessory index data.
     */
    index: {
        /**
         * An index that holds all data for all files, keyed by their URL.
         */
        url: Map<string, any>;
        /**
         * An index that holds all data for all files, keyed by their lang and uuid.
         */
        uuid: Map<string, any>;
        /**
         * An index to hold custom data defined in hooks or queries.
         */
        custom: Map<string, any>;
    };
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
     *
     * @returns The store manager, to allow chaining.
     */
    add(relativeFilepath: string): StoreManager;
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
     * Parses all static and dynamic includes (entity, config, locale, custom and query)
     * from data stored in "store.data".
     *
     * @returns The store manager, to allow chaining.
     */
    parseIncludes(): StoreManager;
    /**
     * Parses all static and dynamic includes (entity, config, locale, custom and query)
     * from one file.
     *
     * @param relativeFilepath - Relative file path, inside dataDir, to the file to be parsed.
     * @param fileContent - The contents of a file.
     *
     * @returns The store manager, to allow chaining.
     */
    parseSingleFileIncludes(relativeFilepath: string, fileContent: any): StoreManager;
    /**
     * Resets store and deletes all loaded data.
     *
     * @returns The store manager, to allow chaining.
     */
    reset(): StoreManager;
};
//# sourceMappingURL=store.types.d.ts.map
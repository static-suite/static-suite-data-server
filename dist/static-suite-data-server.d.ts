/**
 * Possible values for a cache get operation: miss or hit.
 *
 * @public
 */
export declare enum CacheStatus {
    MISS = "miss",
    HIT = "hit"
}

/**
 * The Data Server instance.
 *
 * @public
 */
export declare const dataServer: {
    /**
     * Initializes the Data Server.
     *
     * @param options - Configuration options
     *
     * @returns An object with the data store and the queryRunner service.
     */
    init: (options: DataServerInitOptions) => DataServerReturn;
};

/**
 * Init options for Data Server.
 *
 * @public
 */
export declare type DataServerInitOptions = {
    /**
     * Log level. Optional. @see {@link LogLevel}
     */
    logLevel?: LogLevel;
    /**
     * Path to the log file. Optional. @see {@link LogFile}
     */
    logFile?: LogFile;
    /**
     * Log level for the log file. Optional. @see {@link LogLevel}
     */
    logFileLevel?: LogLevel;
    /**
     * Path to the directory where data is stored.
     */
    dataDir: string;
    /**
     * Path to the directory where work data is stored. Optional.
     */
    workDir?: string;
    /**
     * Path to the directory where queries are stored. Optional.
     */
    queryDir?: string;
    /**
     * Path to the directory where hooks are stored. Optional.
     */
    hookDir?: string;
    /**
     * Path to the directory where tasks are stored. Optional.
     */
    taskDir?: string;
    /**
     * Path to the directory where dumps are stored. Optional.
     */
    dumpDir?: string;
    /**
     * Run mode (dev or prod).
     */
    runMode: RunMode;
};

/**
 * Data returned by Data Server once initialized.
 *
 * @public
 */
export declare type DataServerReturn = {
    /**
     * The data store.
     */
    store: Store;
    /**
     * The query runner, to be able to run queries on demand.
     */
    queryRunner: QueryRunner;
    /**
     * The task runner, to be able to run tasks on demand.
     */
    taskRunner: TaskRunner;
};

/**
 * A log file definition.
 */
export declare type LogFile = {
    /**
     * Path to the log file.
     */
    path: string;
    /**
     * Log level for the log file.
     */
    level: LogLevel;
};

/**
 * Log levels: error, warn, info and debug.
 *
 * @public
 */
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug"
}

/**
 * An object with query arguments.
 *
 * @public
 */
export declare type QueryArgs = Record<string, any>;

/**
 * An error response returned after executing a query.
 *
 * @remarks
 * It takes an string from QueryModule#queryHandler, and wraps them into an
 * structure with metadata. @see {@link QueryModule#default}
 *
 * @public
 */
export declare type QueryErrorResponse = {
    /**
     * Error message from the query, usually coming from a failed validation.
     */
    error: string;
};

/**
 * A module that defines a query.
 */
export declare type QueryModule = {
    /**
     * The handler that executes a query.
     *
     * @remarks
     * It receives the store and a set of arguments, executes the query
     * and returns its results.
     *
     * @param options - An object with options for the query: store and args
     */
    default(options: {
        /**
         * Store data to be used in the query
         */
        store: Store;
        args: QueryArgs;
    }): QueryModuleResult;
};

/**
 * The result that a query returns after being executed.
 */
declare type QueryModuleResult = {
    /**
     * A result, which can be of any kind (and array, an object, a string, etc)
     */
    result: any;
    /**
     * Optional content type for the data available in "result"
     *
     * @remarks
     * Data coming from the query can be anything (XML, a string, etc).
     * This content type is added to the metadata section of the QueryResponse.
     * @see {@link QuerySuccessfulResponse#metadata}.
     *
     * @defaultValue 'application/json'
     */
    contentType?: string;
    /**
     * Optional flag that tells whether this result can be cached or not.
     */
    cacheable?: boolean;
    /**
     * A list of tags to get this query invalidated.
     */
    tags?: string[];
};

/**
 * A service to handle the execution of queries.
 *
 * @public
 */
export declare type QueryRunner = {
    /**
     * Runs a query and returns its results with metadata.
     *
     * @remarks
     * It checks several validations before a query is run, and then it tries to get
     * the query result from cache. If cache is empty, query is executed and saved
     * into the cache.
     *
     * It logs an error and throws an exception if any problem occurs during the
     * query execution.
     *
     * @param queryDefinition - An URL containing a query ID (filename without extension
     * and suffix) of the query to be executed, plus and optional query string with arguments.
     * @see {@link ModuleInfo#id | Definition of a module ID}
     *
     * @returns The result of the query as a JSON object with data and metadata keys,
     * or an error response if some validation is not met.
     *
     * @example
     * Here's a result example:
     * ```
     * {
     * data: ['title 1', 'title 2'],
     *  metadata: {
     *    contentType: 'application/json',
     *    execTime: 2,
     *    cache: ['miss'|'hit'],
     *    num: 2,
     *  }
     * }
     * ```

     * @throws
     * Exception thrown if any problem occurs during the query execution.
     */
    run(queryDefinition: string): QuerySuccessfulResponse | QueryErrorResponse;
    /**
     * Gets number of executed queries.
     *
     * @remarks
     * A simple counter that stores the number of executed queries, of any type.
     *
     * @returns Number of executed queries.
     */
    getCount(): number;
};

/**
 * A successful response returned after executing a query.
 *
 * @remarks
 * It takes the results from a QueryModule#queryHandler, and wraps them into an
 * structure with metadata. @see {@link QueryModule#default}
 *
 * @public
 */
export declare type QuerySuccessfulResponse = {
    /**
     * Data returned by the query. @see {@link QueryModule#default}
     */
    data: any;
    /**
     * Query metadata
     */
    metadata: {
        /**
         * Content type for the data available in "data"
         *
         * @remarks
         * Even thought this structure is a JSON object, data coming from the
         * query can be anything (XML, a string, etc). It must be specified so any
         * consumer of this data knows what is being returned.
         */
        contentType: string;
        /**
         * Execution time taken by the query, in milliseconds.
         */
        execTimeMs: number;
        /**
         * Tells wether the query results comes from a miss or hit.
         */
        cache: CacheStatus;
        /**
         * A list of tags to get this query invalidated.
         */
        tags?: string[];
    };
};

/**
 * Available run modes: dev or prod.
 *
 * @public
 */
export declare enum RunMode {
    DEV = "dev",
    PROD = "prod"
}

/**
 * The store that holds all data.
 */
export declare type Store = {
    /**
     * Initial unique id when the store was initially loaded.
     */
    initialUniqueId: string;
    /**
     * Current unique id to tell when was the store last synced.
     *
     * Every time the store is updated, this id is set with the last modification
     * unique id of the data directory, not the date when the store has finished updating.
     *
     */
    currentUniqueId: string;
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
     * A list of deleted files since last reboot, to be able to track them.
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
         * An index that holds all data for all files, keyed by their langcode and UUID.
         */
        uuid: Map<string, any>;
        /**
         * An index to hold custom data defined in hooks or queries.
         */
        custom: Map<string, any>;
    };
};

declare interface StoreData<K, V> extends Map<K, V> {
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
 * Object holding a subset of items from the store.
 */
declare type StoreSubset = {
    /**
     * Map of elements, with the filename as key
     */
    map: Map<string, any>;
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
 * Options for subset() function.
 */
declare type StoreSubsetOptions = {
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
 * An object with task arguments.
 *
 * @public
 */
declare type TaskArgs = Record<string, any>;

/**
 * An error response returned after executing a task.
 *
 * @remarks
 * It takes an string from TaskModule#taskHandler, and wraps them into an
 * structure with metadata. @see {@link TaskModule#default}
 *
 * @public
 */
declare type TaskErrorResponse = {
    /**
     * Error message from the task, usually coming from a failed validation.
     */
    error: string;
};

/**
 * A service to handle the execution of tasks.
 *
 * @public
 */
export declare type TaskRunner = {
    /**
     * Runs a task and returns its results with metadata.
     *
     * @remarks
     * It checks several validations before a task is run, and then task is executed.
     *
     * It logs an error and throws an exception if any problem occurs during the
     * task execution.
     *
     * @param taskId - Task ID (filename without extension and suffix) of the task
     * to be executed. @see {@link ModuleInfo#id | Definition of a module ID}
     * @param args - Optional object with task arguments.
     *
     * @returns The result of the task as a JSON object with data and metadata keys,
     * or an error response if some validation is not met.
     *
     * @example
     * Here's a result example:
     * ```
     * {
     * data: ['title 1', 'title 2'],
     *  metadata: {
     *    contentType: 'application/json',
     *    execTime: 2,
     *  }
     * }
     * ```

     * @throws
     * Exception thrown if any problem occurs during the task execution.
     */
    run(taskId: string, args: TaskArgs): TaskSuccessfulResponse | TaskErrorResponse;
};

/**
 * A successful response returned after executing a task.
 *
 * @remarks
 * It takes the results from a TaskModule#taskHandler, and wraps them into an
 * structure with metadata. @see {@link TaskModule#default}
 *
 * @public
 */
declare type TaskSuccessfulResponse = {
    /**
     * Data returned by the task. @see {@link TaskModule#default}
     */
    data: any;
    /**
     * Task metadata
     */
    metadata: {
        /**
         * Content type for the data available in "data"
         *
         * @remarks
         * Even thought this structure is a JSON object, data coming from the
         * task can be anything (XML, a string, etc). It must be specified so any
         * consumer of this data knows what is being returned.
         */
        contentType: string;
        /**
         * Execution time taken by the task, in milliseconds.
         */
        execTimeMs: number;
    };
};

export { }

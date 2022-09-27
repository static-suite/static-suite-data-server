import { CacheStatus } from '@lib/query/query.types';
import { LogFile } from '@lib/utils/logger/logger.types';
import { LogLevel } from '@lib/utils/logger/logger.types';
import { QueryArgs } from '@lib/query/query.types';
import { QueryErrorResponse } from '@lib/query/query.types';
import { QueryModule } from '@lib/query/query.types';
import { QueryRunner } from '@lib/query/query.types';
import { QuerySuccessfulResponse } from '@lib/query/query.types';
import { Store } from '@lib/store/store.types';

export { CacheStatus }

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
    store: Store_2;
    /**
     * The query runner, to be able to run queries on demand.
     */
    queryRunner: QueryRunner;
    /**
     * The task runner, to be able to run tasks on demand.
     */
    taskRunner: TaskRunner;
};

export { LogFile }

export { LogLevel }

export { QueryArgs }

export { QueryErrorResponse }

export { QueryModule }

export { QueryRunner }

export { QuerySuccessfulResponse }

/**
 * Available run modes: dev or prod.
 *
 * @public
 */
export declare enum RunMode {
    DEV = "dev",
    PROD = "prod"
}

export { Store }

/**
 * The store that holds all data.
 */
declare type Store_2 = {
    /**
     * Date to tell when was the store last synced.
     *
     * Every time the store is updated, syncDate is set with the last modification
     * date of the data directory, not the date when the store has finished updating.
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
declare type TaskRunner = {
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

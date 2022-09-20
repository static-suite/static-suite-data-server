import { Store } from '@lib/store/store.types';

/**
 * A service to handle the execution of queries.
 *
 * @public
 */
export type QueryRunner = {
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
 * An object with query arguments.
 *
 * @public
 */
export type QueryArgs = Record<string, any>;

/**
 * The result that a query returns after being executed.
 */
export type QueryModuleResult = {
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
 * Possible values for a cache get operation: miss or hit.
 *
 * @public
 */
export enum CacheStatus {
  MISS,
  HIT,
}

/**
 * A successful response returned after executing a query.
 *
 * @remarks
 * It takes the results from a QueryModule#queryHandler, and wraps them into an
 * structure with metadata. @see {@link QueryModule#default}
 *
 * @public
 */
export type QuerySuccessfulResponse = {
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
 * A module that defines a query.
 */
export type QueryModule = {
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
 * An error response returned after executing a query.
 *
 * @remarks
 * It takes an string from QueryModule#queryHandler, and wraps them into an
 * structure with metadata. @see {@link QueryModule#default}
 *
 * @public
 */
export type QueryErrorResponse = {
  /**
   * Error message from the query, usually coming from a failed validation.
   */
  error: string;
};

/**
 * Tells whether a query response is erroneous or not.
 *
 * @param queryResponse - A response (successful or erroneous) from the query handler.
 * @returns True if queryResponse is erroneous.
 */
export const isQueryErrorResponse = (
  queryResponse: QuerySuccessfulResponse | QueryErrorResponse,
): queryResponse is QueryErrorResponse =>
  (queryResponse as QueryErrorResponse).error !== undefined;

export type QueryTagManager = {
  /**
   * Marks query items with any of the specified tags as invalid.
   *
   * @param tags - The list of tags for which to invalidate query items.
   */
  invalidateTags(tags: string[]): void;

  /**
   * Resets the list of invalidated tags once consumed.
   */
  resetInvalidatedTags(): void;

  /**
   * Adds a list of query tags to a query, or removes it if tags are empty.
   *
   * @param queryDefinition - The string containing the query id and its arguments.
   * @param tags - The list of tags for which to invalidate query items.
   */
  setTagsToQuery(
    queryDefinition: string,
    tags: Set<string> | null | undefined,
  ): void;

  /**
   * Gets a list of filepaths which contain an invalidated query.
   *
   * @returns A list of filepaths which contain an invalidated query.
   */
  getInvalidFilepaths(): string[];
};

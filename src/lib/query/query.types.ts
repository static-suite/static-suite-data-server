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
   * @param queryId - Query ID (filename without extension and suffix) of the query
   * to be executed. @see {@link ModuleInfo#id | Definition of a module ID}
   * @param args - Optional object with query arguments.
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
  run(
    queryId: string,
    args: QueryArgs,
  ): QuerySuccessfulResponse | QueryErrorResponse;

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
 * A module that defines a query.
 */
export type QueryModule = {
  /**
   * The handler that executes a query.
   *
   * @remarks
   * It receives the store data and a set of arguments, executes the query
   * and returns its results.
   *
   * @param options - An object with options for the query: data and args
   */
  default(options: {
    /**
     * Store data to be used in the query
     */
    store: any;
    args: QueryArgs;
  }): QueryModuleResult;
};

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
  };
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

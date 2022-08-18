import { Store } from '@lib/store/store.types';

/**
 * A service to handle the execution of tasks.
 *
 * @public
 */
export type TaskRunner = {
  /**
   * Runs a task and returns its results with metadata.
   *
   * @remarks
   * It checks several validations before a task is run, and then it tries to get
   * the task result from cache. If cache is empty, task is executed and saved
   * into the cache.
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
  run(
    taskId: string,
    args: TaskArgs,
  ): TaskSuccessfulResponse | TaskErrorResponse;
};

/**
 * An object with task arguments.
 *
 * @public
 */
export type TaskArgs = Record<string, any>;

/**
 * The result that a task returns after being executed.
 */
export type TaskModuleResult = {
  /**
   * A result, which can be of any kind (and array, an object, a string, etc)
   */
  result: any;

  /**
   * Optional content type for the data available in "result"
   *
   * @remarks
   * Data coming from the task can be anything (XML, a string, etc).
   * This content type is added to the metadata section of the TaskResponse.
   * @see {@link TaskSuccessfulResponse#metadata}.
   *
   * @defaultValue 'application/json'
   */
  contentType?: string;
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
export type TaskSuccessfulResponse = {
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

/**
 * A module that defines a task.
 */
export type TaskModule = {
  /**
   * The handler that executes a task.
   *
   * @remarks
   * It receives the store data and a set of arguments, executes the task
   * and returns its results.
   *
   * @param options - An object with options for the task: data and args
   */
  default(options: {
    /**
     * Store data to be used in the task
     */
    store: Store;
    args: TaskArgs;
  }): TaskModuleResult;
};
/**
 * An error response returned after executing a task.
 *
 * @remarks
 * It takes an string from TaskModule#taskHandler, and wraps them into an
 * structure with metadata. @see {@link TaskModule#default}
 *
 * @public
 */
export type TaskErrorResponse = {
  /**
   * Error message from the task, usually coming from a failed validation.
   */
  error: string;
};

/**
 * Tells whether a task response is erroneous or not.
 *
 * @param taskResponse - A response (successful or erroneous) from the task handler.
 * @returns True if taskResponse is erroneous.
 */
export const isTaskErrorResponse = (
  taskResponse: TaskSuccessfulResponse | TaskErrorResponse,
): taskResponse is TaskErrorResponse =>
  (taskResponse as TaskErrorResponse).error !== undefined;

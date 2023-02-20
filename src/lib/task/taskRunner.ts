import microtime from 'microtime';
import { config } from '../config';
import { store } from '../store';
import { logger } from '../utils/logger';
import { taskManager } from './taskManager';
import {
  TaskRunner,
  TaskErrorResponse,
  TaskSuccessfulResponse,
  TaskModuleResult,
} from './task.types';

let count = 0;

/**
 * Creates a TaskErrorResponse object ready to be returned to clients.
 *
 * @param message - Error message
 *
 * @returns A JSON object with an error key
 *
 * @internal
 */
const createErrorResponse = (message: string): TaskErrorResponse => {
  logger.error(message);
  return { error: message };
};

export const taskRunner: TaskRunner = {
  run: (taskId, args): TaskSuccessfulResponse | TaskErrorResponse => {
    if (!config.taskDir) {
      return createErrorResponse('No task directory ("taskDir") configured');
    }
    if (!taskId) {
      return createErrorResponse('No task ID received');
    }
    const taskModuleInfo = taskManager.getModuleGroupInfo().get(taskId);
    if (!taskModuleInfo) {
      return createErrorResponse(`Task module for ID ${taskId} not found`);
    }

    count += 1;
    const startDate = microtime.now();
    const argsString = JSON.stringify(args);
    logger.debug(`#${count} Task started: "${taskId}", args "${argsString}"`);
    const taskResult: TaskModuleResult = {
      result: undefined,
      contentType: undefined,
    };
    try {
      const taskModule = taskModuleInfo.getModule();
      const taskResponse = taskModule.default({
        store,
        args,
      });
      taskResult.result = taskResponse?.result;

      taskResult.contentType = taskResponse?.contentType || 'application/json';
    } catch (e) {
      // Log error and rethrow.
      logger.error(
        `#${count} Task error: "${taskId}", args "${argsString}": ${e}`,
      );
      throw e;
    }
    const execTimeMs = (microtime.now() - startDate) / 1000;
    const response: TaskSuccessfulResponse = {
      data: taskResult.result,
      metadata: {
        contentType: taskResult.contentType || 'application/json',
        execTimeMs,
      },
    };

    logger.debug(`#${count} Task "${taskId}" took ${execTimeMs} ms.`);

    return response;
  },
};

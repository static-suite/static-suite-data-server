"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskRunner = void 0;
const microtime_1 = __importDefault(require("microtime"));
const config_1 = require("../config");
const store_1 = require("../store");
const logger_1 = require("../utils/logger");
const taskManager_1 = require("./taskManager");
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
const createErrorResponse = (message) => {
    logger_1.logger.error(message);
    return { error: message };
};
exports.taskRunner = {
    run: (taskId, args) => {
        if (!config_1.config.taskDir) {
            return createErrorResponse('No task directory ("taskDir") configured');
        }
        if (!taskId) {
            return createErrorResponse('No task ID received');
        }
        const taskModuleInfo = taskManager_1.taskManager.getModuleGroupInfo().get(taskId);
        if (!taskModuleInfo) {
            return createErrorResponse(`Task module for ID ${taskId} not found`);
        }
        count += 1;
        const startDate = microtime_1.default.now();
        const argsString = JSON.stringify(args);
        logger_1.logger.debug(`#${count} Task started: "${taskId}", args "${argsString}"`);
        const taskResult = {
            result: undefined,
            contentType: undefined,
        };
        try {
            const taskModule = taskModuleInfo.getModule();
            const taskResponse = taskModule.default({
                store: store_1.store,
                args,
            });
            taskResult.result = taskResponse?.result;
            taskResult.contentType = taskResponse?.contentType || 'application/json';
        }
        catch (e) {
            // Log error and rethrow.
            logger_1.logger.error(`#${count} Task error: "${taskId}", args "${argsString}": ${e}`);
            throw e;
        }
        const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
        const response = {
            data: taskResult.result,
            metadata: {
                contentType: taskResult.contentType || 'application/json',
                execTimeMs,
            },
        };
        logger_1.logger.debug(`#${count} Task "${taskId}" took ${execTimeMs} ms.`);
        return response;
    },
};

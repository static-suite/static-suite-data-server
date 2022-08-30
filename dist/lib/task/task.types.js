"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTaskErrorResponse = void 0;
/**
 * Tells whether a task response is erroneous or not.
 *
 * @param taskResponse - A response (successful or erroneous) from the task handler.
 * @returns True if taskResponse is erroneous.
 */
const isTaskErrorResponse = (taskResponse) => taskResponse.error !== undefined;
exports.isTaskErrorResponse = isTaskErrorResponse;

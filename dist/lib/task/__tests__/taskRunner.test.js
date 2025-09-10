"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const dataServer_types_1 = require("../../dataServer.types");
const logger_1 = require("../../utils/logger");
const task_types_1 = require("../task.types");
const taskRunner_1 = require("../taskRunner");
const taskManager_1 = require("../taskManager");
beforeEach(() => {
    config_1.config.taskDir = fs_1.default.realpathSync(path_1.default.resolve('src/__tests__/fixtures/task'));
    config_1.config.runMode = dataServer_types_1.RunMode.PROD;
});
describe('TaskRunner test', () => {
    describe('getAvailableTaskIds', () => {
        it('Returns correct tasks ids from fixtures', () => {
            expect(Array.from(taskManager_1.taskManager.getModuleGroupInfo().keys())).toEqual([
                'error',
                'noHandler',
                'task1',
                'task2',
            ]);
        });
    });
    describe('run', () => {
        it('Returns task data', () => {
            const taskResponse = taskRunner_1.taskRunner.run('task1', {
                x: 'x',
                y: '33',
            });
            const data = !(0, task_types_1.isTaskErrorResponse)(taskResponse) && taskResponse.data[0];
            expect(data.id).toEqual('33');
        });
        it('Logs error when task fails', () => {
            logger_1.logger.error = jest.fn();
            try {
                taskRunner_1.taskRunner.run('error', {});
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            }
            catch (e) {
                // none
            }
            expect(logger_1.logger.error).toHaveBeenCalled();
        });
    });
});

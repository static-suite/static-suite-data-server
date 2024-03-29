import fs from 'fs';
import path from 'path';
import { config } from '../../config';
import { RunMode } from '../../dataServer.types';
import { logger } from '../../utils/logger';
import { isTaskErrorResponse } from '../task.types';
import { taskRunner } from '../taskRunner';
import { taskManager } from '../taskManager';

beforeEach(() => {
  config.taskDir = fs.realpathSync(path.resolve('src/__tests__/fixtures/task'));
  config.runMode = RunMode.PROD;
});

describe('TaskRunner test', () => {
  describe('getAvailableTaskIds', () => {
    it('Returns correct tasks ids from fixtures', () => {
      expect(Array.from(taskManager.getModuleGroupInfo().keys())).toEqual([
        'error',
        'noHandler',
        'task1',
        'task2',
      ]);
    });
  });

  describe('run', () => {
    it('Returns task data', () => {
      const taskResponse = taskRunner.run('task1', {
        x: 'x',
        y: '33',
      });
      const data = !isTaskErrorResponse(taskResponse) && taskResponse.data[0];
      expect(data.id).toEqual('33');
    });

    it('Logs error when task fails', () => {
      logger.error = jest.fn();
      try {
        taskRunner.run('error', {});
      } catch (e) {
        // none
      }
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

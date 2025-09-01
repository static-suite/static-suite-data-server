import { Request, Response } from 'express';
import { dataDirManager } from '../../lib/store/dataDir';
import { taskRunner, taskManager } from '../../lib/task';
import {
  TaskErrorResponse,
  TaskSuccessfulResponse,
} from '../../lib/task/task.types';

const taskIndex = (req: Request, res: Response): void => {
  const taskIds = Array.from(taskManager.getModuleGroupInfo().keys());
  res.render('taskIndex', {
    taskIds: taskIds.length > 0 ? taskIds.map(task => `/task/${task}`) : null,
  });
};

const runTask = (req: Request, res: Response): void => {
  dataDirManager.update();
  const args: any = req.query;
  const taskId = req.params[0];
  const response: TaskSuccessfulResponse | TaskErrorResponse = taskRunner.run(
    taskId,
    args,
  );
  res.status(
    'metadata' in response && response.metadata.httpStatus
      ? response.metadata.httpStatus
      : 200,
  );
  res.set({
    'Content-Type':
      'metadata' in response
        ? response.metadata.contentType
        : 'application/json',
  });
  res.send('data' in response ? response.data : response);
};

export { taskIndex, runTask };

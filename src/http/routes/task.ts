import { Request, Response } from 'express';
import { dataDirManager } from '@lib/store/dataDir';
import { taskRunner, taskManager } from '@lib/store/task';
import {
  TaskErrorResponse,
  TaskSuccessfulResponse,
} from '@lib/store/task/task.types';

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
  res.status(200);
  res.set('application/json');
  res.send(response);
};

export { taskIndex, runTask };

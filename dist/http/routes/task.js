"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTask = exports.taskIndex = void 0;
const dataDir_1 = require("@lib/store/dataDir");
const task_1 = require("@lib/task");
const taskIndex = (req, res) => {
    const taskIds = Array.from(task_1.taskManager.getModuleGroupInfo().keys());
    res.render('taskIndex', {
        taskIds: taskIds.length > 0 ? taskIds.map(task => `/task/${task}`) : null,
    });
};
exports.taskIndex = taskIndex;
const runTask = (req, res) => {
    dataDir_1.dataDirManager.update();
    const args = req.query;
    const taskId = req.params[0];
    const response = task_1.taskRunner.run(taskId, args);
    res.status(200);
    res.set('application/json');
    res.send(response);
};
exports.runTask = runTask;

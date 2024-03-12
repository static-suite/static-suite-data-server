"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWatcher = void 0;
const config_1 = require("../config");
const dataDirManager_1 = require("../store/dataDir/dataDirManager");
const logger_1 = require("../utils/logger");
const cache_1 = require("../utils/cache");
const fs_1 = require("../utils/fs");
const hook_1 = require("../store/hook");
const query_1 = require("../query");
const task_1 = require("../task");
/**
 * Initializes a watcher on any file inside queryDir, hookDir and taskDir.
 *
 * @remarks
 * If runMode is DEV and queryDir, hookDir and/or taskDir are defined by current
 * configuration, a watcher is initialized on them.
 *
 * When something changes inside query directory:
 * 1) Remove all modules inside the query directory, so they are required again.
 * 2) Clear the query cache, since that is not done by the queryManager.
 *
 * When something changes inside hook directory:
 * 1) Remove all modules inside the hook directory, so they are required again.
 * 2) Reload the whole data directory so hooks can be reapplied (this implies clearing the query cache).
 */
const initWatcher = () => {
    const paths = [];
    if (config_1.config.queryDir) {
        paths.push(config_1.config.queryDir);
    }
    if (config_1.config.hookDir) {
        paths.push(config_1.config.hookDir);
    }
    if (config_1.config.taskDir) {
        paths.push(config_1.config.taskDir);
    }
    const listener = (filePath) => {
        // Remove all modules inside the query directory.
        if (config_1.config.queryDir && filePath.startsWith(config_1.config.queryDir)) {
            query_1.queryManager.reset();
            // Clear all queries, since they are stale.
            // No need to clear the store subset cache, since no
            // file has been added/updated/deleted.
            cache_1.cache.bin('query').clear();
        }
        // Remove all modules inside the hook directory and reload the whole
        // data directory so hooks can be reapplied.
        if (config_1.config.hookDir && filePath.startsWith(config_1.config.hookDir)) {
            hook_1.hookManager.reset();
            dataDirManager_1.dataDirManager.load();
            logger_1.logger.debug('Re-building store done');
        }
        // Remove all modules inside the task directory.
        if (config_1.config.taskDir && filePath.startsWith(config_1.config.taskDir)) {
            task_1.taskManager.reset();
        }
    };
    (0, fs_1.watch)(paths, {
        add: listener,
        change: listener,
        unlink: listener,
    });
};
exports.initWatcher = initWatcher;

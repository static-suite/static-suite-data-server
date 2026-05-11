import { version } from '../../package.json';
import { configureLogger, logger } from './utils/logger';
import { LogLevel, LogFile } from './utils/logger/logger.types';
import { initWatcher } from './watcher';
import { setConfig } from './config';
import { dataDirManager } from './store/dataDir';
import { store } from './store';
import { Store } from './store/store.types';
import { queryRunner } from './query';
import { taskRunner } from './task/taskRunner';
import { TaskRunner } from './task/task.types';
import {
  QueryRunner,
  QuerySuccessfulResponse,
  QueryErrorResponse,
  QueryArgs,
  QueryModule,
  CacheStatus,
} from './query/query.types';
import {
  RunMode,
  DataServerReturn,
  DataServerInitOptions,
} from './dataServer.types';
import { dumpIndexHelper } from './store/dump/dumpIndexHelper';

/**
 * The Data Server instance.
 *
 * @public
 */
const dataServer = {
  /**
   * Initializes the Data Server.
   *
   * @param options - Configuration options
   *
   * @returns An object with the data store and the queryRunner service.
   */
  init: (options: DataServerInitOptions): DataServerReturn => {
    const startDate = Date.now();

    // Configure logger.
    configureLogger(options.logLevel, options.logFile);

    // Configure data server.
    const config = setConfig({
      dataDir: options.dataDir,
      workDir: options.workDir,
      queryDir: options.queryDir,
      hookDir: options.hookDir,
      taskDir: options.taskDir,
      dumpDir: options.dumpDir,
      runMode: options.runMode,
    });

    // Start watcher.
    if (config.runMode === RunMode.DEV) {
      initWatcher();
    }

    // Load data from dataDir.
    dataDirManager.load();

    // Create and load dump index.
    if (config.dumpDir) {
      if (
        dumpIndexHelper.isDumpIndexStale() ||
        !dumpIndexHelper.isDumpIndexPresent()
      ) {
        dumpIndexHelper.createDumpIndex();
      }
      dumpIndexHelper.loadDumpIndex();
    }

    logger.info(
      `Data Server ${version} loaded in ${Date.now() - startDate}ms.`,
    );

    return {
      store,
      queryRunner,
      taskRunner,
    };
  },
};
export {
  dataServer,
  DataServerInitOptions,
  DataServerReturn,
  RunMode,
  LogLevel,
  LogFile,
  Store,
  QueryRunner,
  QuerySuccessfulResponse,
  QueryErrorResponse,
  QueryArgs,
  QueryModule,
  TaskRunner,
  CacheStatus,
};

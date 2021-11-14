import { configureLogger } from '@lib/utils/logger';
import { LogLevel, LogFile } from '@lib/utils/logger/logger.types';
import { initWatcher } from '@lib/watcher';
import { setConfig } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir';
import { store } from '@lib/store';
import { queryRunner } from '@lib/query';
import {
  QueryRunner,
  QuerySuccessfulResponse,
  QueryErrorResponse,
  QueryArgs,
  CacheStatus,
} from '@lib/query/query.types';
import {
  RunMode,
  DataServerReturn,
  DataServerInitOptions,
} from './dataServer.types';

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
    // Configure logger.
    configureLogger(options.logLevel, options.logFile);

    // Configure data server.
    const config = setConfig({
      dataDir: options.dataDir,
      workDir: options.workDir,
      queryDir: options.queryDir,
      hookDir: options.hookDir,
      runMode: options.runMode,
    });

    // Start watcher.
    if (config.runMode === RunMode.DEV) {
      initWatcher();
    }

    // Load data from dataDir.
    dataDirManager.load({ incremental: false });

    return {
      data: store.data,
      queryRunner,
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
  QueryRunner,
  QuerySuccessfulResponse,
  QueryErrorResponse,
  QueryArgs,
  CacheStatus,
};

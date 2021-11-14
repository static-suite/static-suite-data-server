import { configureLogger, logger } from '@lib/utils/logger';
import { initWatcher } from '@lib/watcher';
import { setConfig } from '@lib/config';
import { dataDirManager } from '@lib/store/dataDir';
import { store } from '@lib/store';
import { queryRunner } from '@lib/query';
import {
  RunMode,
  DataServerReturn,
  DataServerInitOptions,
} from './dataServer.types';

export const dataServer = {
  /**
   * Initializes the Data Server.
   *
   * @param options - Configuration options
   *
   * @returns An object with store, queryRunner and logger.
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
      logger,
    };
  },
};

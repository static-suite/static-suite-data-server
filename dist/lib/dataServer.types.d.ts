import { LogLevel, LogFile } from '@lib/utils/logger/logger.types';
import { QueryRunner } from '@lib/query/query.types';
import { Store } from './store/store.types';
import { TaskRunner } from './store/task/task.types';
/**
 * Init options for Data Server.
 *
 * @public
 */
export declare type DataServerInitOptions = {
    /**
     * Log level. Optional. @see {@link LogLevel}
     */
    logLevel?: LogLevel;
    /**
     * Path to the log file. Optional. @see {@link LogFile}
     */
    logFile?: LogFile;
    /**
     * Log level for the log file. Optional. @see {@link LogLevel}
     */
    logFileLevel?: LogLevel;
    /**
     * Path to the directory where data is stored.
     */
    dataDir: string;
    /**
     * Path to the directory where work data is stored. Optional.
     */
    workDir?: string;
    /**
     * Path to the directory where queries are stored. Optional.
     */
    queryDir?: string;
    /**
     * Path to the directory where hooks are stored. Optional.
     */
    hookDir?: string;
    /**
     * Path to the directory where tasks are stored. Optional.
     */
    taskDir?: string;
    /**
     * Run mode (dev or prod).
     */
    runMode: RunMode;
};
/**
 * Available run modes: dev or prod.
 *
 * @public
 */
export declare enum RunMode {
    DEV = "dev",
    PROD = "prod"
}
/**
 * A helper to get RunMode type as strings. @see {@link RunMode}.
 */
export declare type RunModeStrings = keyof typeof RunMode;
/**
 * Data returned by Data Server once initialized.
 *
 * @public
 */
export declare type DataServerReturn = {
    /**
     * The data store.
     */
    store: Store;
    /**
     * The query runner, to be able to run queries on demand.
     */
    queryRunner: QueryRunner;
    /**
     * The task runner, to be able to run tasks on demand.
     */
    taskRunner: TaskRunner;
};
//# sourceMappingURL=dataServer.types.d.ts.map
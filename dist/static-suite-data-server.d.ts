import { CacheStatus } from '@lib/query/query.types';
import { LogFile } from '@lib/utils/logger/logger.types';
import { LogLevel } from '@lib/utils/logger/logger.types';
import { QueryArgs } from '@lib/query/query.types';
import { QueryErrorResponse } from '@lib/query/query.types';
import { QueryRunner } from '@lib/query/query.types';
import { QuerySuccessfulResponse } from '@lib/query/query.types';

export { CacheStatus }

/**
 * The Data Server instance.
 *
 * @public
 */
export declare const dataServer: {
    /**
     * Initializes the Data Server.
     *
     * @param options - Configuration options
     *
     * @returns An object with the data store and the queryRunner service.
     */
    init: (options: DataServerInitOptions) => DataServerReturn;
};

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
     * Run mode (dev or prod).
     */
    runMode: RunMode;
};

/**
 * Data returned by Data Server once initialized.
 *
 * @public
 */
export declare type DataServerReturn = {
    /**
     * The data store.
     */
    data: any;
    /**
     * The query runner, to be able to run queries on demand.
     */
    queryRunner: QueryRunner;
};

export { LogFile }

export { LogLevel }

export { QueryArgs }

export { QueryErrorResponse }

export { QueryRunner }

export { QuerySuccessfulResponse }

/**
 * Available run modes: dev or prod.
 *
 * @public
 */
export declare enum RunMode {
    DEV = "dev",
    PROD = "prod"
}

export { }

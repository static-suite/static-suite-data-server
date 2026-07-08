import { LogLevel, LogFile } from './utils/logger/logger.types';
import { DataDirManager } from './store/dataDir/dataDir.types';
import { ChangedFiles, AllChangesItem } from './store/workDir/workDir.types';
import { Store, StoreData, StoreSubset, StoreSubsetOptions } from './store/store.types';
import { TaskRunner, TaskArgs, TaskSuccessfulResponse, TaskErrorResponse } from './task/task.types';
import { QueryRunner, QuerySuccessfulResponse, QueryErrorResponse, QueryArgs, QueryModule, QueryModuleResult, CacheStatus } from './query/query.types';
import { RunMode, DataServerReturn, DataServerInitOptions } from './dataServer.types';
/**
 * The Data Server instance.
 *
 * @public
 */
declare const dataServer: {
    /**
     * Initializes the Data Server.
     *
     * @param options - Configuration options
     *
     * @returns An object with the data store and the queryRunner service.
     */
    init: (options: DataServerInitOptions) => DataServerReturn;
};
export { dataServer, DataServerInitOptions, DataServerReturn, RunMode, LogLevel, LogFile, Store, StoreData, StoreSubset, StoreSubsetOptions, QueryRunner, QuerySuccessfulResponse, QueryErrorResponse, QueryArgs, QueryModule, QueryModuleResult, TaskRunner, CacheStatus, DataDirManager, ChangedFiles, TaskArgs, TaskSuccessfulResponse, TaskErrorResponse, AllChangesItem, };
//# sourceMappingURL=dataServer.d.ts.map
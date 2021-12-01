import { LogLevel, LogFile } from '@lib/utils/logger/logger.types';
import { QueryRunner, QuerySuccessfulResponse, QueryErrorResponse, QueryArgs, CacheStatus } from '@lib/query/query.types';
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
export { dataServer, DataServerInitOptions, DataServerReturn, RunMode, LogLevel, LogFile, QueryRunner, QuerySuccessfulResponse, QueryErrorResponse, QueryArgs, CacheStatus, };
//# sourceMappingURL=dataServer.d.ts.map
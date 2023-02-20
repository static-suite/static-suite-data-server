import { config } from '../../../config';
import { RunMode } from '../../../dataServer.types';
import { queryRunner } from '../../../query';
import { isQueryErrorResponse } from '../../../query/query.types';
import { getObjValue } from '../../../utils/object';
import { QueryIncludeParserOptions } from '../includeParser.types';
import { aliasWithoutTypeIncludeParser } from './types/aliasWithoutTypeIncludeParser';

/**
 * Parses query includes.
 *
 * @remarks
 * Instead of executing a query and adding its result to a JSON file,
 * create a Proxy so queries are only executed when they are consumed,
 * in a Just-In-Time way.
 */
export const queryIncludeParser = ({
  host,
  includePath,
}: QueryIncludeParserOptions): void => {
  const queryDefinition = getObjValue(host, includePath);
  if (!queryDefinition) {
    return;
  }

  // Execute the query when the "data" property is accessed.
  const proxyHandler = {
    get: (target: any, prop: string) => {
      if (prop === 'data') {
        const queryResponse = queryRunner.run(queryDefinition);
        if (isQueryErrorResponse(queryResponse)) {
          return config.runMode === RunMode.DEV
            ? `${queryResponse.error} (message visible only in run mode DEV)`
            : null;
        }
        return queryResponse.data;
      }
      return undefined;
    },
  };
  const target = new Proxy({ data: null }, proxyHandler);

  const mountPath = includePath.split('.');
  const includeKey = mountPath.pop();
  if (includeKey) {
    aliasWithoutTypeIncludeParser(
      { host, target, mountPath, includeKey },
      'query',
    );
  }
};

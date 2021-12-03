import { queryRunner } from '@lib/query';
import { isQueryErrorResponse } from '@lib/query/query.types';
import { getObjValue } from '@lib/utils/object';
import { parseURLSearchParams } from '@lib/utils/string';
import { QueryIncludeParserOptions } from '../includeParser.types';
import { aliasWithoutTypeIncludeParser } from './types/aliasWithoutTypeIncludeParser';

export const queryIncludeParser = ({
  host,
  includePath,
}: QueryIncludeParserOptions): void => {
  const queryDefinition = getObjValue(host, includePath);
  if (!queryDefinition) {
    return;
  }
  const [queryId, rawQueryArgs] = queryDefinition.split('?');
  const queryArgs = rawQueryArgs ? parseURLSearchParams(rawQueryArgs) : {};
  const queryResponse = queryRunner.run(queryId, queryArgs);
  const target = isQueryErrorResponse(queryResponse)
    ? queryResponse.error
    : queryResponse.data;
  const mountPath = includePath.split('.');
  const includeKey = mountPath.pop();
  if (includeKey) {
    aliasWithoutTypeIncludeParser(
      { host, target, mountPath, includeKey },
      'query',
    );
  }
};

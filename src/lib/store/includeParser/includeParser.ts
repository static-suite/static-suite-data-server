import { queryRunner } from '@lib/query';
import { isQueryErrorResponse } from '@lib/query/query.types';
import { getObjectValue } from '@lib/utils/object';
import { store } from '..';
import { JsonIncludeMetadata } from './includeParser.types';
import { aliasWithoutTypeIncludeParser } from './parsers/types/aliasWithoutTypeIncludeParser';
import {
  configIncludeParser,
  customIncludeParser,
  entityIncludeParser,
  localeIncludeParser,
} from './parsers';

/**
 * Parses a raw query string into an object.
 *
 * @remarks
 * Turns a string like "arg1=a&arg2=b" into an object like
 * \{ arg1: 'a', arg2: 'b'\}
 *
 * @param queryString - A raw query string
 *
 * @returns An object where its keys are the query arguments.
 */
const parseQueryParams = (queryString: string) => {
  // Parse query string.
  const params = new URLSearchParams(queryString);

  const obj: Record<string, any> = {};
  Array.from(params.keys()).forEach((key: string) => {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key);
    } else {
      obj[key] = params.get(key);
    }
  });
  return obj;
};

/**
 * Global parser that is able to parse static and dynamic includes.
 */
export const includeParser = {
  static: (fileContent: JsonIncludeMetadata): void => {
    if (!fileContent) {
      return;
    }

    const jsonData = fileContent;
    if (!jsonData.metadata?.includes) {
      return;
    }

    jsonData.metadata?.includes.forEach((includePath: string) => {
      const targetKey = getObjectValue(fileContent, includePath);
      const includeData = store.data.get(targetKey);
      const mountPointPath = includePath.split('.');
      const includeKey = mountPointPath.pop();
      if (!includeKey) {
        return;
      }

      const normalizedIncludeKey = includeKey.toLowerCase();
      if (normalizedIncludeKey.endsWith('configinclude')) {
        configIncludeParser({
          fileContent,
          includeData,
          mountPointPath,
          includeKey,
        });
      }
      if (normalizedIncludeKey.endsWith('entityinclude')) {
        entityIncludeParser({
          fileContent,
          includeData,
          mountPointPath,
        });
      }
      if (normalizedIncludeKey.endsWith('custominclude')) {
        customIncludeParser({
          fileContent,
          includeData,
          mountPointPath,
          includeKey,
        });
      }
      if (normalizedIncludeKey.endsWith('localeinclude')) {
        localeIncludeParser({
          fileContent,
          includeData,
          mountPointPath,
          includeKey,
        });
      }
    });
  },
  dynamic: (fileContent: JsonIncludeMetadata): void => {
    if (!fileContent) {
      return;
    }

    const jsonData = fileContent;
    if (!jsonData.metadata?.includes) {
      return;
    }

    jsonData.metadata?.includes.forEach((includePath: string) => {
      if (!includePath.toLowerCase().endsWith('queryinclude')) {
        return;
      }
      const queryData = getObjectValue(fileContent, includePath).split('?');
      const queryId = queryData[0];
      const queryArgs = queryData[1] ? parseQueryParams(queryData[1]) : {};
      const queryResponse = queryRunner.run(queryId, queryArgs);
      const includeData = isQueryErrorResponse(queryResponse)
        ? queryResponse.error
        : queryResponse.data;
      const mountPointPath = includePath.split('.');
      const includeKey = mountPointPath.pop();
      if (includeKey) {
        aliasWithoutTypeIncludeParser(
          {
            fileContent,
            includeData,
            mountPointPath,
            includeKey,
          },
          'query',
        );
      }
    });
  },
};

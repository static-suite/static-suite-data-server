import { logger } from '@lib/utils/logger';
import { URLSearchParamsObject } from './string.types';

/**
 * Separator for variant data files saved to storage.
 *
 * @remarks
 * Refers to the separator that is used by variant data files when they are
 * saved. If a "master" data file name is "12345.json", and its variant keys
 * are "card" and "search", its resulting variant file names are:
 *   - 12345--card.json
 *   - 12345--search.json
 * @see ExporterPluginInterface::VARIANT_SEPARATOR in https://www.drupal.org/project/static_suite
 *
 * @sealed
 * Not intended to be over ride.
 */
export const VARIANT_SEPARATOR = '--';

/**
 * Parses a JSON string and logs an error on failure.
 *
 * @param jsonString - The string to be parsed.
 *
 * @returns A JSON object or null on error.
 */
export const parseJsonString = (jsonString: string): any => {
  let json = null;
  try {
    json = JSON.parse(jsonString);
  } catch (error) {
    logger.error(`Error parsing JSON data "${jsonString}": ${error}`);
  }
  return json;
};

/**
 * Parses a raw URL search (aka "query string") into an object.
 *
 * @remarks
 * Turns a string like "arg1=a&arg2=b" into an object like
 * \{ arg1: 'a', arg2: 'b'\}
 *
 * @param queryString - A raw URL search string
 *
 * @returns An object where its keys are the query arguments.
 */
export const parseURLSearchParams = (
  queryString: string,
): URLSearchParamsObject => {
  const params = new URLSearchParams(queryString);
  const obj: URLSearchParamsObject = {};
  Array.from(params.keys()).forEach(key => {
    if (params.getAll(key).length > 1) {
      obj[key] = params.getAll(key);
    } else {
      obj[key] = params.get(key);
    }
  });
  return obj;
};

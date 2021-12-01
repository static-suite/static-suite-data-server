import path from 'path';
import { logger } from '@lib/utils/logger';

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
 * Gets a data file's variant key
 *
 * @param filePath - Absolute path to the data file
 *
 * @returns The file's variant key, or null if not found
 */
export const getVariantKey = (filePath: string): string | null => {
  const fileName = path.parse(filePath).name;
  if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
    return fileName.split(VARIANT_SEPARATOR).pop() || null;
  }
  return null;
};

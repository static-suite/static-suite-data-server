import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { logger } from '@lib/utils/logger';
import { FileType } from './fs.types';

/**
 * A set of various functions related to the file system
 */

/**
 * Separator for variant data files saved to storage.
 *
 * @remarks
 * Refers to the separator that is used by variant data files when they are
 * saved. If a "master" data file name is "12345.json", and its variant keys
 * are "card" and "search", its resulting variant file names are:
 *   - 12345--card.json
 *   - 12345--search.json
 * @see Drupal\static_export\Exporter\ExporterPluginInterface::VARIANT_SEPARATOR
 * in https://www.drupal.org/project/static_suite
 *
 * @sealed
 * Not intended to be over ride.
 */
const VARIANT_SEPARATOR = '--';

/**
 * Tells whether a path is JSON or not.
 *
 * @remarks
 * A fast checker that avoids reading the contents of a file, or doing
 * some other complex operation to determine if a file contains JSON data.
 */
const isJson = (filepath: string): boolean => filepath.substr(-5) === '.json';

/**
 * Reads a file and logs an error on failure.
 *
 * @param absoluteFilePath - Absolute path to the file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
export const readFile = (absoluteFilePath: string): string | null => {
  let contents = null;
  try {
    contents = fs.readFileSync(absoluteFilePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading file "${absoluteFilePath}": ${error}`);
  }
  return contents;
};

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
 * Gets raw and JSON parsed content from a file.
 *
 * @param absoluteFilePath - Relative path to the file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null.
 */
export const getFileContent = (absoluteFilePath: string): FileType => {
  const raw = readFile(absoluteFilePath);
  let json = null;
  if (isJson(absoluteFilePath) && raw) {
    json = parseJsonString(raw);
    if (!json) {
      logger.error(`Error getting JSON from file "${absoluteFilePath}"`);
    }
  }
  return { raw, json };
};

/**
 * Finds all files inside a directory
 *
 * @param dir - Absolute path to the directory to be scanned
 * @param glob - Optional glob to filter results
 *
 * @returns Array of file paths found inside directory
 */
export const findFilesInDir = (dir: string, glob = '**/*'): string[] => {
  const startDate = Date.now();
  const files = fg.sync([glob], { cwd: dir, dot: false });
  const endDate = Date.now();
  logger.debug(
    `${files.length} files found inside ${dir} in ${endDate - startDate}ms.`,
  );
  return files;
};

/**
 * Gets a file's modification date
 *
 * @param filePath - Absolute path to the directory to be scanned
 *
 * @returns The file's modification date as a Date object, or null on error
 */
export const getModificationDate = (filePath: string): Date | null => {
  let modificationDate = null;
  try {
    modificationDate = fs.statSync(filePath).mtime;
  } catch (e) {
    logger.error(`Error getting modification date for ${`path`}: ${e}`);
  }
  return modificationDate;
};

/**
 * Gets a data file's variant key
 *
 * @param filePath - Absolute path to the data file
 *
 * @returns The file's variant key, or null on error
 */
export const getVariantKey = (filePath: string): string | null => {
  const fileName = path.parse(filePath).name;
  if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
    return fileName.split(VARIANT_SEPARATOR).pop() || null;
  }
  return null;
};

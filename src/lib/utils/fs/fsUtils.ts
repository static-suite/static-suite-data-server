import fs from 'fs';
import fg from 'fast-glob';
import { logger } from '@lib/utils/logger';
import { parseJsonString } from '@lib/utils/string';
import { FileType } from './fs.types';

/**
 * A set of various functions related to the file system
 */

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
 * Gets raw and JSON parsed content from a file.
 *
 * @param absoluteFilePath - Relative path to the file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
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
 * @param glob - Optional glob to filter results (default all files recursive '**\/*')
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
 * Gets a file's modification date and logs an error on failure.
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

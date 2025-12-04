import fs from 'fs';
import path from 'path';
import fg, { Options as fastGlobOptions } from 'fast-glob';
import { logger } from '../logger';
import { parseJsonString } from '../string';
import { FileType } from './fs.types';

/**
 * Tells whether a path is JSON or not.
 *
 * @remarks
 * A fast checker that avoids reading the contents of a file, or doing
 * some other complex operation to determine if a file contains JSON data.
 *
 * @internal
 */
export const isJsonFile = (filepath: string): boolean =>
  filepath.slice(-5) === '.json';

/**
 * Reads a file and logs an error on failure.
 *
 * @param filePath - A path to a file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
export const readFile = (filePath: string): string | null => {
  let content = null;
  try {
    content = fs.readFileSync(filePath, { encoding: 'utf8', flag: 'r' });
  } catch (error) {
    // When an error is thrown, content is undefined, so ensure
    // it is converted to null.
    content = null;
    logger.error(`Error reading file "${filePath}": ${error}`);
  }
  return content;
};

/**
 * Gets raw and JSON parsed content from a file.
 *
 * @param filepath - A path to a file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
 */
export const getFileContent = (filepath: string): FileType => {
  const raw = readFile(filepath);
  let json = null;
  if (raw && isJsonFile(filepath)) {
    json = parseJsonString(raw);
    if (!json) {
      logger.error(`Error getting JSON from file "${filepath}"`);
    }
  }
  return { raw, json };
};

/**
 * Finds all files inside a directory
 *
 * @param dir - Absolute path to the directory to be scanned
 * @param glob - Optional glob to filter results (default all files recursive '**\/*')
 * @param options - Options for the fast-glob package.
 * See https://www.npmjs.com/package/fast-glob for reference .
 *
 * @returns Array of file paths found inside directory
 */
export const findFilesInDir = (
  dir: string,
  glob = '**/*',
  options: fastGlobOptions = { absolute: false },
): string[] => {
  const startDate = Date.now();
  const files = fg.sync([glob], { cwd: dir, ...options });
  const endDate = Date.now();
  logger.debug(
    `${files.length} files found inside ${dir} in ${endDate - startDate}ms.`,
  );
  return files;
};

/**
 * Gets a file's modification date and logs an error on failure.
 *
 * @param filePath - Path to the file
 *
 * @returns The file's modification date as a Date object, or null on error
 */
export const getModificationDate = (filePath: string): Date | null => {
  let modificationDate = null;
  try {
    modificationDate = new Date(fs.statSync(filePath).mtime);
  } catch (e) {
    logger.error(`Error getting modification date for ${`path`}: ${e}`);
  }
  return modificationDate;
};

/**
 * Removes empty directories upwards.
 *
 * @param dir - Path to a directory
 */
export const removeEmptyDirsUpwards = (dir: string): void => {
  const isEmpty = fs.readdirSync(dir).length === 0;
  if (isEmpty) {
    try {
      fs.rmdirSync(dir);
    } catch (e) {
      logger.debug(`Error deleting empty directory "${dir}": ${e}`);
    }
    removeEmptyDirsUpwards(path.dirname(dir));
  }
};


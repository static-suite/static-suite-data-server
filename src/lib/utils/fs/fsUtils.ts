import fs from 'fs';
import fg, { Options as fastGlobOptions } from 'fast-glob';
import chokidar from 'chokidar';
import { logger } from '@lib/utils/logger';
import { parseJsonString } from '@lib/utils/string';
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
const isJson = (filepath: string): boolean => filepath.substr(-5) === '.json';

/**
 * Reads a file and logs an error on failure.
 *
 * @param filePath - A path to a file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
export const readFile = (filePath: string): string | null => {
  let contents = null;
  try {
    contents = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    // When an error is thrown, contents is undefined, so ensure
    // it is converted to null.
    contents = null;
    logger.error(`Error reading file "${filePath}": ${error}`);
  }
  return contents;
};

/**
 * Gets raw and JSON parsed content from a file.
 *
 * @param filePath - A path to a file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
 */
export const getFileContent = (filePath: string): FileType => {
  const raw = readFile(filePath);
  let json = null;
  if (isJson(filePath) && raw) {
    json = parseJsonString(raw);
    if (!json) {
      logger.error(`Error getting JSON from file "${filePath}"`);
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
 * Watches for changes on a set of paths and attach listener to them
 *
 * @remarks
 * It handles three different events: add, change and unlink
 *
 * @param paths - An array of paths to be watched
 * @param listeners - An object with three optional event keys (add, change and unlink)
 * and a listener function as value. That function will be executed once any of
 * the event keys is dispatched.
 */
export const watch = (
  paths: string[],
  listeners: Record<'add' | 'change' | 'unlink', (filePath: string) => void>,
): void => {
  if (paths.length > 0) {
    const watcher = chokidar.watch(paths, {
      ignored: /(^|[/\\])\../,
      persistent: true,
    });

    // Add event listeners. None of these events need to clear any query cache,
    // since they only run on dev mode, where caches are disabled. They only
    // need to rebuild the store if a post processor changes.
    watcher.on('ready', () => {
      logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
      watcher
        .on('add', filePath => {
          logger.debug(`File ${filePath} added`);
          listeners.add(filePath);
        })
        .on('change', filePath => {
          logger.debug(`File ${filePath} changed`);
          listeners.change(filePath);
        })
        .on('unlink', filePath => {
          logger.debug(`File ${filePath} removed`);
          listeners.unlink(filePath);
        });
    });
  }
};

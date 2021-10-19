import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import { logger } from '@lib/utils/logger';

const VARIANT_SEPARATOR = '--';

export type Json = {
  [key: string]: unknown;
  __FILENAME__?: string;
};

export type FileType = {
  raw: string | null;
  json: Json | null;
};

export const isJson = (file: string): boolean => file.substr(-5) === '.json';

export const readFile = (absoluteFilePath: string): string | null => {
  let contents = null;
  try {
    contents = fs.readFileSync(absoluteFilePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading file "${absoluteFilePath}": ${error}`);
  }
  return contents;
};

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
 * Get raw and JSON parsed content from a file.
 *
 * @param {string} absoluteFilePath - Relative path to the file.
 *
 * @return {FileType} Object with two properties, "raw" and "json", which contain
 *                   the raw and json version of the file.
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
 * Find all files inside a directory.
 *
 * @param {string} dir - Relative path to the directory to be scanned.
 *
 * @return {array} files - Array of file paths found inside dir.
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

export const getModificationDate = (filePath: string): Date | null => {
  let modificationDate = null;
  try {
    modificationDate = fs.statSync(filePath).mtime;
  } catch (e) {
    logger.error(`Error getting modification date for ${`path`}: ${e}`);
  }
  return modificationDate;
};

export const getVariantName = (filePath: string): string | undefined => {
  const fileName = path.parse(filePath).name;
  if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
    return fileName.split(VARIANT_SEPARATOR).pop();
  }
  return undefined;
};

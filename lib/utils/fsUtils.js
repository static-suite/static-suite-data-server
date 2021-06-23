const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const { logger } = require('./logger');

const VARIANT_SEPARATOR = '--';

const isJson = file => file.substr(-5) === '.json';

/**
 * Get raw contents from a file.
 *
 * @param {string} absoluteFilePath - Relative path to the file.
 *
 * @return {string} File contents.
 */
const readFile = absoluteFilePath => {
  let contents = null;
  try {
    contents = fs.readFileSync(absoluteFilePath, 'utf8');
  } catch (error) {
    logger.error(`Error reading file "${absoluteFilePath}": ${error}`);
  }
  return contents;
};

/**
 * Parse JSON string.
 *
 * @param {string} jsonString - A JSON string.
 *
 * @return {Object} A JSON object.
 */
const parseJsonString = jsonString => {
  let json = null;
  try {
    json = JSON.parse(jsonString);
  } catch (error) {
    logger.error(`Error parsing JSON data "${jsonString}": ${error}`);
  }
  return json;
};

/**
 * Get raw and JSON parsed contents from a file.
 *
 * @param {string} absoluteFilePath - Relative path to the file.
 *
 * @return {Object} Object with two properties, "raw" and "json", which contain
 *                   the raw and json version of the file.
 */
const getFileContents = absoluteFilePath => {
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
const findFilesInDir = (dir, glob = '**/*') => {
  const startDate = Date.now();
  const files = fg.sync([glob], { cwd: dir, dot: false });
  const endDate = Date.now();
  logger.debug(
    `${files.length} files found inside ${dir} in ${endDate - startDate}ms.`,
  );
  return files;
};

/**
 * Get modification date of a path.
 *
 * @return {Date} - The modification date.
 */
const getModificationDate = filePath => {
  let modificationDate = null;
  try {
    modificationDate = fs.statSync(filePath, 'utf8').mtime;
  } catch (e) {
    logger.error(`Error getting modification date for ${`path`}: ${e}`);
  }
  return modificationDate;
};

const getVariantName = filePath => {
  const fileName = path.parse(filePath).name;
  if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
    return fileName.split(VARIANT_SEPARATOR).pop();
  }
  return null;
};

module.exports = {
  isJson,
  readFile,
  getFileContents,
  findFilesInDir,
  getModificationDate,
  getVariantName,
};

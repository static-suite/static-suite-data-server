const fs = require('fs');

const config = Object.create(null); // no inherited properties

/**
 * Configure the data server.
 *
 * @param {Object} options Configuration options
 * @param {string} options.dataDir - Absolute path to the directory where data is stored.
 * @param {string} options.workDir - Absolute path to the directory where work data is stored.
 * @param {string} options.queryDir - Absolute path to the directory where queries are stored.
 * @param {string} options.postProcessor - Absolute path to the post processor file.
 * @param {string} options.runMode - Run mode (dev or prod).
 *
 * @returns {Object} - The config object.
 */
const setConfig = (options = {}) => {
  // Check that required options are provided
  if (!options.dataDir) {
    throw Error('Required option not provided: "dataDir".');
  }
  if (
    !fs.existsSync(options.dataDir) ||
    !fs.lstatSync(options.dataDir).isDirectory()
  ) {
    throw Error(`Cannot find dataDir directory: "${options.dataDir}"`);
  }
  if (!options.workDir) {
    throw Error('Required option not provided: "workDir".');
  }
  if (
    !fs.existsSync(options.workDir) ||
    !fs.lstatSync(options.workDir).isDirectory()
  ) {
    throw Error(`Cannot find workDir directory: "${options.workDir}"`);
  }
  if (
    options.queryDir &&
    (!fs.existsSync(options.queryDir) ||
      !fs.lstatSync(options.queryDir).isDirectory())
  ) {
    throw Error(`Cannot find queryDir directory: ${options.queryDir}`);
  }
  if (!options.runMode) {
    throw Error('Required option not provided: "runMode"');
  }
  if (!['dev', 'prod'].includes(options.runMode)) {
    throw Error(
      `Invalid value provided for "runMode": "${options.runMode}". Valid options are "dev" or "prod"`,
    );
  }

  Object.keys(options).forEach(key => {
    Object.defineProperty(config, key, {
      enumerable: true,
      configurable: false,
      writable: false,
      // Remove leading slash from all directories.
      value: options[key]?.replace(/\/$/, ''),
    });
  });
  return config;
};

module.exports.config = config;
module.exports.setConfig = setConfig;

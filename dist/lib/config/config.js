"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const dataServer_types_1 = require("@lib/dataServer.types");
const objectUtils_1 = require("@lib/utils/objectUtils");
const config = Object.create(null); // no inherited properties
exports.config = config;
/**
 * Configure the data server.
 *
 * @param {Object} options Configuration options
 * @param {string} options.dataDir - Relative path to the directory where data is stored.
 * @param {string} options.workDir - Relative path to the directory where work data is stored.
 * @param {string} options.queryDir - Relative path to the directory where queries are stored.
 * @param {string} options.postProcessor - Relative path to the post processor module.
 * @param {string} options.runMode - Run mode (dev or prod).
 *
 * @return {Object} - The config object.
 */
const setConfig = (options) => {
    const localOptions = options;
    // Check that required options are provided
    if (!localOptions.dataDir) {
        throw Error('Required option not provided: "dataDir".');
    }
    localOptions.dataDir = (0, path_1.resolve)(localOptions.dataDir);
    if (!fs_1.default.existsSync(localOptions.dataDir) ||
        !fs_1.default.lstatSync(localOptions.dataDir).isDirectory()) {
        throw Error(`Cannot find dataDir directory: "${localOptions.dataDir}"`);
    }
    if (localOptions.workDir) {
        localOptions.workDir = (0, path_1.resolve)(localOptions.workDir);
        if (!fs_1.default.existsSync(localOptions.workDir) ||
            !fs_1.default.lstatSync(localOptions.workDir).isDirectory()) {
            throw Error(`Cannot find workDir directory: "${localOptions.workDir}"`);
        }
    }
    if (localOptions.queryDir) {
        localOptions.queryDir = (0, path_1.resolve)(localOptions.queryDir);
        if (!fs_1.default.existsSync(localOptions.queryDir) ||
            !fs_1.default.lstatSync(localOptions.queryDir).isDirectory()) {
            throw Error(`Cannot find queryDir directory: ${localOptions.queryDir}`);
        }
    }
    if (localOptions.postProcessor) {
        localOptions.postProcessor = (0, path_1.resolve)(localOptions.postProcessor);
        if (!fs_1.default.existsSync(localOptions.postProcessor)) {
            throw Error(`Cannot find postProcessor module: ${localOptions.postProcessor}`);
        }
    }
    if (!localOptions.runMode) {
        throw Error('Required option not provided: "runMode"');
    }
    if (!Object.values(dataServer_types_1.RunMode).includes(localOptions.runMode)) {
        throw Error(`Invalid value provided for "runMode": "${localOptions.runMode}". Valid options are ${Object.values(dataServer_types_1.RunMode).join(' or ')}`);
    }
    Object.keys(localOptions).forEach(key => {
        if ((0, objectUtils_1.hasKey)(localOptions, key)) {
            Object.defineProperty(config, key, {
                enumerable: true,
                configurable: false,
                writable: false,
                // Remove leading slash from all directories.
                value: key === 'runMode'
                    ? localOptions[key]
                    : localOptions[key]?.replace(/\/$/, ''),
            });
        }
    });
    return config;
};
exports.setConfig = setConfig;

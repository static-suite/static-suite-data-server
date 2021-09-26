"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const objectUtils_1 = require("../utils/objectUtils");
const runMode_1 = require("../types/runMode");
exports.config = Object.create(null); // no inherited properties
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
    // Check that required options are provided
    if (!options.dataDir) {
        throw Error('Required option not provided: "dataDir".');
    }
    options.dataDir = (0, path_1.resolve)(options.dataDir);
    if (!fs_1.default.existsSync(options.dataDir) ||
        !fs_1.default.lstatSync(options.dataDir).isDirectory()) {
        throw Error(`Cannot find dataDir directory: "${options.dataDir}"`);
    }
    if (options.workDir) {
        options.workDir = (0, path_1.resolve)(options.workDir);
        if (!fs_1.default.existsSync(options.workDir) ||
            !fs_1.default.lstatSync(options.workDir).isDirectory()) {
            throw Error(`Cannot find workDir directory: "${options.workDir}"`);
        }
    }
    if (options.queryDir) {
        options.queryDir = (0, path_1.resolve)(options.queryDir);
        if (!fs_1.default.existsSync(options.queryDir) ||
            !fs_1.default.lstatSync(options.queryDir).isDirectory()) {
            throw Error(`Cannot find queryDir directory: ${options.queryDir}`);
        }
    }
    if (options.postProcessor) {
        options.postProcessor = (0, path_1.resolve)(options.postProcessor);
        if (!fs_1.default.existsSync(options.postProcessor)) {
            throw Error(`Cannot find postProcessor module: ${options.postProcessor}`);
        }
    }
    if (!options.runMode) {
        throw Error('Required option not provided: "runMode"');
    }
    if (!Object.values(runMode_1.RunMode).includes(options.runMode)) {
        throw Error(`Invalid value provided for "runMode": "${options.runMode}". Valid options are ${Object.values(runMode_1.RunMode).join(' or ')}`);
    }
    Object.keys(options).forEach(key => {
        if ((0, objectUtils_1.hasKey)(options, key)) {
            Object.defineProperty(exports.config, key, {
                enumerable: true,
                configurable: false,
                writable: false,
                // Remove leading slash from all directories.
                value: key === 'runMode' ? options[key] : options[key]?.replace(/\/$/, ''),
            });
        }
    });
    return exports.config;
};
exports.setConfig = setConfig;

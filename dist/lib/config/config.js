"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataServer_types_1 = require("@lib/dataServer.types");
const object_1 = require("@lib/utils/object");
const error_1 = require("./error");
const config = Object.create(null); // no inherited properties
exports.config = config;
/**
 * Configures the data server.
 *
 * @remarks
 * It validates provided configuration and returns a sanitized and immutable
 * configuration object. It throws several errors if validation is not passing.
 *
 * @param options - Configuration options, @see {@link ConfigOptions}
 *
 * @returns - The sanitized and immutable configuration object.
 *
 * @throws {@link MissingRequiredOption}
 * Exception thrown if the dataDir or runMode are not provided.
 *
 * @throws {@link MissingDirectory}
 * Exception thrown if any of the provided paths (dataDir, workDir,
 * queryDir, hookDir or taskDir) is not found.
 *
 * @throws {@link InvalidRunMode}
 * Exception thrown if runMode is not valid.
 */
const setConfig = (options) => {
    const localOptions = options;
    // Check that required options are provided.
    // Since this method is publicly accessible at runtime, it is not
    // possible to rely on TypeScript type safety.
    if (!localOptions.dataDir) {
        throw new error_1.MissingRequiredOption('dataDir');
    }
    localOptions.dataDir = path_1.default.resolve(localOptions.dataDir);
    if (!fs_1.default.existsSync(localOptions.dataDir) ||
        !fs_1.default.lstatSync(localOptions.dataDir).isDirectory()) {
        throw new error_1.MissingDirectory('dataDir', localOptions.dataDir);
    }
    // fs.realpathSync() throws and error if path does not exist.
    localOptions.dataDir = fs_1.default.realpathSync(localOptions.dataDir);
    if (localOptions.workDir) {
        localOptions.workDir = path_1.default.resolve(localOptions.workDir);
        if (!fs_1.default.existsSync(localOptions.workDir) ||
            !fs_1.default.lstatSync(localOptions.workDir).isDirectory()) {
            throw new error_1.MissingDirectory('workDir', localOptions.workDir);
        }
        // fs.realpathSync() throws and error if path does not exist.
        localOptions.workDir = fs_1.default.realpathSync(localOptions.workDir);
    }
    if (localOptions.queryDir) {
        localOptions.queryDir = path_1.default.resolve(localOptions.queryDir);
        if (!fs_1.default.existsSync(localOptions.queryDir) ||
            !fs_1.default.lstatSync(localOptions.queryDir).isDirectory()) {
            throw new error_1.MissingDirectory('queryDir', localOptions.queryDir);
        }
        // fs.realpathSync() throws and error if path does not exist.
        localOptions.queryDir = fs_1.default.realpathSync(localOptions.queryDir);
    }
    if (localOptions.hookDir) {
        localOptions.hookDir = path_1.default.resolve(localOptions.hookDir);
        if (!fs_1.default.existsSync(localOptions.hookDir) ||
            !fs_1.default.lstatSync(localOptions.hookDir).isDirectory()) {
            throw new error_1.MissingDirectory('hookDir', localOptions.hookDir);
        }
        // fs.realpathSync() throws and error if path does not exist.
        localOptions.hookDir = fs_1.default.realpathSync(localOptions.hookDir);
    }
    if (localOptions.taskDir) {
        localOptions.taskDir = path_1.default.resolve(localOptions.taskDir);
        if (!fs_1.default.existsSync(localOptions.taskDir) ||
            !fs_1.default.lstatSync(localOptions.taskDir).isDirectory()) {
            throw new error_1.MissingDirectory('taskDir', localOptions.taskDir);
        }
        // fs.realpathSync() throws and error if path does not exist.
        localOptions.taskDir = fs_1.default.realpathSync(localOptions.taskDir);
    }
    if (localOptions.dumpDir) {
        localOptions.dumpDir = path_1.default.resolve(localOptions.dumpDir);
        if (!fs_1.default.existsSync(localOptions.dumpDir) ||
            !fs_1.default.lstatSync(localOptions.dumpDir).isDirectory()) {
            throw new error_1.MissingDirectory('dumpDir', localOptions.dumpDir);
        }
        // fs.realpathSync() throws and error if path does not exist.
        localOptions.dumpDir = fs_1.default.realpathSync(localOptions.dumpDir);
    }
    if (!localOptions.runMode) {
        localOptions.runMode = dataServer_types_1.RunMode.PROD;
    }
    if (!Object.values(dataServer_types_1.RunMode).includes(localOptions.runMode)) {
        throw new error_1.InvalidRunMode(localOptions.runMode);
    }
    Object.keys(localOptions).forEach(key => {
        if ((0, object_1.hasKey)(localOptions, key)) {
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

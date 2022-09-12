"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracker = void 0;
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("@lib/config");
const logger_1 = require("@lib/utils/logger");
const object_1 = require("@lib/utils/object");
const includeIndex_1 = require("../include/includeIndex");
/**
 * A list of changed files with includes that have changed since last reset.
 */
const changedFiles = new Set();
/**
 * A flag to tell wether getChangedFiles() has been already called.
 */
let isChangedFilesInitialized = false;
// Ensure several concurrent Data Servers use different files.
let trackerFilepath = null;
const getTrackerFilepath = () => {
    if (!trackerFilepath) {
        const dataDirHash = config_1.config.dataDir
            .replace(/\//g, '-')
            .replace(/([^a-zA-Z0-9-])/g, '')
            .replace(/^-/g, '')
            .replace(/-$/g, '');
        trackerFilepath = `${os_1.default.homedir()}/.static-suite/data-server/${dataDirHash}/tracker.json`;
    }
    return trackerFilepath;
};
exports.tracker = {
    trackChangedFile(relativeFilepath) {
        // Add parents.
        includeIndex_1.includeIndex
            .getParents(relativeFilepath)
            .forEach((parentRelativeFilepath) => {
            changedFiles.add(parentRelativeFilepath);
        });
        // Add the passed file.
        changedFiles.add(relativeFilepath);
        // Store memory data into disk
        const trackerFile = getTrackerFilepath();
        const dataToStore = JSON.stringify({ changedFiles: (0, object_1.jsonify)(changedFiles) });
        try {
            if (!fs_1.default.existsSync(trackerFile)) {
                fs_1.default.mkdirSync(path_1.default.dirname(trackerFile), { recursive: true });
            }
            fs_1.default.writeFileSync(trackerFile, dataToStore);
        }
        catch (e) {
            logger_1.logger.error(`Error writing tracker file located at "${trackerFile}": ${e}`);
        }
    },
    getChangedFiles: () => {
        const trackerFile = getTrackerFilepath();
        // The first time this function is executed (after Data Server is started for the first time),
        // it tries to get changed files from previously stored value on disk.
        if (!isChangedFilesInitialized && fs_1.default.existsSync(trackerFile)) {
            try {
                const trackerFileData = JSON.parse(fs_1.default.readFileSync(trackerFile).toString().trim());
                isChangedFilesInitialized = true;
                trackerFileData.changedFiles?.forEach((changedFile) => changedFiles.add(changedFile));
            }
            catch (e) {
                logger_1.logger.error(`Error reading tracker file located at "${trackerFile}": ${e}`);
            }
        }
        return Array.from(changedFiles);
    },
    reset: () => {
        changedFiles.clear();
        // Delete tracker file.
        const trackerFile = getTrackerFilepath();
        if (fs_1.default.existsSync(trackerFile)) {
            fs_1.default.unlinkSync(trackerFile);
        }
    },
};

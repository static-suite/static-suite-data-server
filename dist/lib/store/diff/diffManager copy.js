"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffManager = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const microtime_1 = __importDefault(require("microtime"));
const logger_1 = require("@lib/utils/logger");
const store_1 = require("../store");
const config_1 = require("../../config");
const workDir_1 = require("../workDir");
const includeIndex_1 = require("../include/includeIndex");
const dataDirManager_1 = require("../dataDir/dataDirManager");
let lastDiffDateFilepath = null;
let lastDiffDate = null;
const trackedChangedFiles = new Set();
// Ensure several concurrent Data Servers use different files.
const getLastDiffDateFilepath = () => {
    if (!lastDiffDateFilepath) {
        const dataDirHash = config_1.config.dataDir
            .replace(/\//g, '-')
            .replace(/([^a-zA-Z0-9-])/g, '')
            .replace(/^-/g, '')
            .replace(/-$/g, '');
        lastDiffDateFilepath = `${os_1.default.tmpdir()}/static-suite-data-server--last-diff-date.${dataDirHash}.dat`;
    }
    return lastDiffDateFilepath;
};
const getLastDiffDate = () => {
    const lastDiffDatePath = getLastDiffDateFilepath();
    // The first time this function is executed (after Data Server is started for the first time),
    // it tries to get last diff date from previously stored value on disk.
    if (!lastDiffDate && fs_1.default.existsSync(lastDiffDatePath)) {
        try {
            const storedLastDiffDateAsTimestamp = fs_1.default
                .readFileSync(lastDiffDatePath)
                .toString()
                .trim();
            if (storedLastDiffDateAsTimestamp) {
                lastDiffDate = new Date(parseInt(storedLastDiffDateAsTimestamp, 10));
            }
        }
        catch (e) {
            logger_1.logger.error(`Error reading diff metadata file located at ${`lastDiffDateFilepath`}: ${e}`);
        }
    }
    return lastDiffDate;
};
const setLastDiffDate = (date) => {
    const lastDiffDatePath = getLastDiffDateFilepath();
    try {
        fs_1.default.writeFileSync(lastDiffDatePath, date.getTime().toString());
    }
    catch (e) {
        logger_1.logger.error(`Error writing diff metadata file located at ${`lastDiffDatePath`}: ${e}`);
    }
    lastDiffDate = date;
};
const getUpdatedFilesByQueries = () => {
    // todo
    const updatedFilesByQueries = [];
    store_1.store.data.forEach((json, relativeFilepath) => {
        if (json.metadata?.includes?.dynamic) {
            updatedFilesByQueries.push(relativeFilepath);
        }
    });
    return updatedFilesByQueries;
};
exports.diffManager = {
    trackChangedFile(file) {
        // Add parents.
        includeIndex_1.includeIndex.getParents(file).forEach((parent) => {
            trackedChangedFiles.add(parent);
        });
        // Add the passed file.
        trackedChangedFiles.add(file);
    },
    resetDiff(date) {
        setLastDiffDate(date);
        trackedChangedFiles.clear();
    },
    getDiff() {
        const startDate = microtime_1.default.now();
        dataDirManager_1.dataDirManager.update();
        let updated = new Set();
        let deleted = new Set();
        const sinceDate = getLastDiffDate();
        logger_1.logger.debug(`Getting diff using date "${sinceDate}"`);
        if (sinceDate) {
            // Only process changedFiles if not empty.
            const changedFiles = workDir_1.workDirHelper.getChangedFilesSince(sinceDate);
            if (changedFiles.updated.length || changedFiles.deleted.length) {
                // Update tracked files so no affected parent is missed.
                changedFiles.updated.forEach(file => {
                    exports.diffManager.trackChangedFile(file);
                });
                changedFiles.deleted.forEach(file => {
                    exports.diffManager.trackChangedFile(file);
                });
            }
            // Create the resulting set of updated and deleted files.
            // "updated" includes all affected parents tracked down
            // by trackChangedIncludes(), without any deleted file.
            updated = new Set(trackedChangedFiles);
            changedFiles.deleted.forEach(updated.delete);
            // "deleted" includes only deleted files, and is based only
            // on data coming from changedFiles, because all deleted files
            // are stored on Static Suite Data Server log
            deleted = new Set(changedFiles.deleted);
            // Add updated files affected by queries only if "updated" or "deleted"
            // contain any changes.
            if (updated.size > 0 || deleted.size > 0) {
                // getUpdatedFilesByQueries().forEach(updated.add);
            }
        }
        else {
            // If no sinceDate is passed, return all files
            updated = new Set(store_1.store.data.keys());
        }
        const diff = {
            since: sinceDate ? sinceDate.getTime() : new Date(0).getTime(),
            updated,
            deleted,
        };
        logger_1.logger.info(`Diff created in ${(microtime_1.default.now() - startDate) / 1000} ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`);
        // Log diff if not empty
        // if (diff.updated.length || diff.deleted.length) {
        // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
        // }
        return diff;
    },
};

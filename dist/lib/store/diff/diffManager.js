"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffManager = void 0;
const microtime_1 = __importDefault(require("microtime"));
const logger_1 = require("@lib/utils/logger");
const store_1 = require("../store");
const dataDirManager_1 = require("../dataDir/dataDirManager");
const dependencyManager_1 = require("../dependency/dependencyManager");
const workDir_1 = require("../workDir");
const dumpMetadataHelper_1 = require("../dump/dumpMetadataHelper");
let lastDiffUniqueId = workDir_1.unixEpochUniqueId;
exports.diffManager = {
    reset(uniqueId) {
        lastDiffUniqueId = uniqueId;
        dependencyManager_1.dependencyManager.reset();
    },
    getDiff(options = { incremental: true }) {
        const startDate = microtime_1.default.now();
        // Before getting any diff data, update any pending changes from data dir.
        const changedFiles = dataDirManager_1.dataDirManager.update();
        const updated = new Set();
        const deleted = new Set();
        const currentDumpUniqueId = dumpMetadataHelper_1.dumpMetadataHelper.getCurrentDumpUniqueId();
        const isFirstDiffAfterReboot = lastDiffUniqueId === workDir_1.unixEpochUniqueId;
        const isADumpAvailable = currentDumpUniqueId !== workDir_1.unixEpochUniqueId;
        // If both checks passes, check if something has changed after last dump to avoid a full diff:
        if (isFirstDiffAfterReboot && isADumpAvailable) {
            const dataDirModificationUniqueId = changedFiles.toUniqueId;
            if (currentDumpUniqueId === store_1.store.initialUniqueId) {
                // If nothing changed, use store.initialUniqueId as lastDiffUniqueId, to
                // execute an incremental dump.
                lastDiffUniqueId = store_1.store.initialUniqueId;
            }
            else {
                // If something changed, keep lastDiffUniqueId as is, and get the list of
                // changed files from last dump. From that list, we need deleted files, since
                // those files are no more in data dir and we need to remove them from dump dir.
                const changedFilesSinceLastDump = workDir_1.workDirHelper.getChangedFilesBetween(currentDumpUniqueId, dataDirModificationUniqueId);
                changedFilesSinceLastDump.deleted.forEach(filepath => deleted.add(filepath));
            }
        }
        if (options.incremental && lastDiffUniqueId !== workDir_1.unixEpochUniqueId) {
            logger_1.logger.debug(`Getting incremental diff using date "${lastDiffUniqueId}"`);
            const invalidatedFilepaths = dependencyManager_1.dependencyManager.getInvalidatedFilepaths();
            invalidatedFilepaths.updated.forEach(filepath => updated.add(filepath));
            invalidatedFilepaths.deleted.forEach(filepath => deleted.add(filepath));
        }
        else {
            // Return all files
            logger_1.logger.debug(`Getting full diff with no date`);
            Array.from(store_1.store.data.keys()).forEach(key => updated.add(key));
        }
        const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
        const diff = {
            execTimeMs,
            fromUniqueId: lastDiffUniqueId,
            toUniqueId: changedFiles.toUniqueId,
            updated,
            deleted,
        };
        logger_1.logger.info(`Diff created in ${execTimeMs} ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`);
        // Log diff if not empty
        // if (diff.updated.length || diff.deleted.length) {
        // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
        // }
        return diff;
    },
};

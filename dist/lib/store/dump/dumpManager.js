"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const microtime_1 = __importDefault(require("microtime"));
const logger_1 = require("@lib/utils/logger");
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const includeDiffManager_1 = require("../include/includeDiffManager");
const hook_1 = require("../hook");
const removeEmptyDirsUpwards = (dir) => {
    const isEmpty = fs_1.default.readdirSync(dir).length === 0;
    if (isEmpty) {
        try {
            fs_1.default.rmdirSync(dir);
        }
        catch (e) {
            logger_1.logger.debug(`Error deleting empty directory "${dir}": ${e}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        removeEmptyDirsUpwards(path_1.default.dirname(dir));
    }
};
const storeUpdatedFiles = (updated, dumpDir) => {
    updated.forEach((targetRelativeFilepath, sourceRelativeFilepath) => {
        const fileContent = store_1.store.data.get(sourceRelativeFilepath);
        if (fileContent) {
            const absoluteFilepath = `${dumpDir}/${targetRelativeFilepath}`;
            try {
                const dir = path_1.default.dirname(absoluteFilepath);
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                fs_1.default.writeFileSync(absoluteFilepath, JSON.stringify(fileContent));
            }
            catch (e) {
                logger_1.logger.error(`Dump: error writing file "${sourceRelativeFilepath}" to "${absoluteFilepath}": ${e}`);
            }
        }
        else {
            logger_1.logger.error(`Dump: data for file "${targetRelativeFilepath}" not found.`);
        }
    });
};
const removeDeletedFiles = (deletedFiles, dumpDir) => {
    deletedFiles.forEach((relativeFilepath) => {
        const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
        try {
            if (fs_1.default.existsSync(absoluteFilepath)) {
                fs_1.default.unlinkSync(absoluteFilepath);
            }
        }
        catch (e) {
            logger_1.logger.error(`Dump: error deleting file "${relativeFilepath}" from "${absoluteFilepath}": ${e}`);
        }
    });
};
const storeDiffMetadata = (metadataFilepath, diff, diffResetDate) => {
    let currentDiffMetadata = [];
    try {
        currentDiffMetadata = JSON.parse(fs_1.default.readFileSync(metadataFilepath).toString());
    }
    catch (e) {
        currentDiffMetadata = [];
    }
    currentDiffMetadata.push(diff);
    try {
        const currentDiffMetadataString = JSON.stringify(currentDiffMetadata);
        fs_1.default.writeFileSync(metadataFilepath, currentDiffMetadataString);
        // Resetting the diff must happen when its metadata is successfully
        // stored into disk.
        includeDiffManager_1.includeDiffManager.resetDiff(diffResetDate);
    }
    catch (e) {
        logger_1.logger.error(`Dump: error saving diff metadata to "${metadataFilepath}": ${e}`);
    }
};
const createDumpFromDiff = (diff) => {
    const dump = {
        since: diff.since,
        updated: new Map(),
        deleted: new Set(diff.deleted),
    };
    // By default, all files are dumped to the same filepath
    // where their original raw data is stored.
    diff.updated.forEach((relativeFilepath) => {
        dump.updated.set(relativeFilepath, relativeFilepath);
    });
    return dump;
};
exports.dumpManager = {
    dump() {
        if (config_1.config.dumpDir) {
            const startDate = microtime_1.default.now();
            const dumpDir = `${config_1.config.dumpDir}/files`;
            const metadataFilepath = `${config_1.config.dumpDir}/diff-metadata.json`;
            // Create a dump object from a diff.
            const diffResetDate = new Date();
            const diff = includeDiffManager_1.includeDiffManager.getDiff();
            let dump = createDumpFromDiff(diff);
            // Invoke "onDump" hook.
            const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
            hookModulesInfo.forEach(hookInfo => {
                const hookModule = hookInfo.getModule();
                if (hookModule.onDump && config_1.config.dumpDir) {
                    dump = hookModule.onDump({
                        dataDir: config_1.config.dataDir,
                        dumpDir: config_1.config.dumpDir,
                        store: store_1.store,
                        dump,
                    });
                }
            });
            if (dump.updated.size || dump.deleted.size) {
                // Store updated files.
                storeUpdatedFiles(dump.updated, dumpDir);
                // Remove deleted files.
                removeDeletedFiles(dump.deleted, dumpDir);
                // Merge and store diff metadata.
                storeDiffMetadata(metadataFilepath, diff, diffResetDate);
                logger_1.logger.info(`Dump created in ${(microtime_1.default.now() - startDate) / 1000} ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`);
            }
            else {
                logger_1.logger.info('Dump not created since it is empty.');
            }
        }
        else {
            logger_1.logger.error('dumpDir option not provided. Dump cannot be executed.');
        }
    },
};

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
const object_1 = require("@lib/utils/object");
const fs_2 = require("@lib/utils/fs");
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const diffManager_1 = require("../diff/diffManager");
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
const storeUpdatedFiles = (diff, dump, dumpDir) => {
    diff.updated.forEach(relativeFilepath => {
        const storeFileContentData = store_1.store.data.get(relativeFilepath);
        if (storeFileContentData) {
            const absoluteFilepathInDumpDir = `${dumpDir}/${relativeFilepath}`;
            try {
                // Create parent directories if they are missing.
                const dir = path_1.default.dirname(absoluteFilepathInDumpDir);
                if (!fs_1.default.existsSync(dir)) {
                    fs_1.default.mkdirSync(dir, { recursive: true });
                }
                // If store data is an object, stringify it to execute its
                // queries and resolve its includes.
                const isJson = (0, fs_2.isJsonFile)(relativeFilepath);
                const storeFileContentString = isJson
                    ? JSON.stringify(storeFileContentData)
                    : storeFileContentData;
                // Before overwriting a file, check it has changed.
                let needsSave = true;
                let oldPublicUrl = null;
                const newPublicUrl = storeFileContentData.data?.content?.url?.path || null;
                if (fs_1.default.existsSync(absoluteFilepathInDumpDir)) {
                    const dumpFileContentString = (0, fs_2.readFile)(absoluteFilepathInDumpDir);
                    if (storeFileContentString === dumpFileContentString) {
                        // No need to save it, file has not changed.
                        needsSave = false;
                    }
                    else if (isJson && dumpFileContentString) {
                        // Get old public URL before it changes on disk.
                        oldPublicUrl =
                            JSON.parse(dumpFileContentString)?.data?.content?.url?.path ||
                                null;
                    }
                }
                if (needsSave) {
                    // Save it.
                    fs_1.default.writeFileSync(absoluteFilepathInDumpDir, storeFileContentString);
                    // Mark it as updated.
                    dump.updated.set(relativeFilepath, {
                        oldPublicUrl,
                        newPublicUrl,
                    });
                }
            }
            catch (e) {
                logger_1.logger.error(`Dump: error writing file "${absoluteFilepathInDumpDir}": ${e}`);
            }
        }
        else {
            logger_1.logger.error(`Dump: store data for file "${relativeFilepath}" not found.`);
        }
    });
};
const removeDeletedFiles = (diff, dump, dumpDir) => {
    diff.deleted.forEach(relativeFilepath => {
        const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
        try {
            if (fs_1.default.existsSync(absoluteFilepath)) {
                // Get old public URLs before they change on disk.
                const dumpContent = (0, fs_2.getFileContent)(absoluteFilepath);
                const oldPublicUrl = dumpContent.json?.data?.content?.url?.path;
                // Delete it.
                fs_1.default.unlinkSync(absoluteFilepath);
                // Mark it as deleted.
                dump.deleted.set(relativeFilepath, {
                    oldPublicUrl,
                    newPublicUrl: null,
                });
            }
        }
        catch (e) {
            logger_1.logger.error(`Dump: error deleting file "${absoluteFilepath}": ${e}`);
        }
    });
};
const storeDumpMetadata = (metadataFilepath, dump, diffResetDate) => {
    let currentDumpMetadata = [];
    try {
        currentDumpMetadata = JSON.parse(fs_1.default.readFileSync(metadataFilepath).toString());
    }
    catch (e) {
        currentDumpMetadata = [];
    }
    currentDumpMetadata.push((0, object_1.jsonify)(dump));
    try {
        const currentDumpMetadataString = JSON.stringify(currentDumpMetadata);
        fs_1.default.writeFileSync(metadataFilepath, currentDumpMetadataString);
        // Resetting the diff must happen when dump metadata is successfully
        // stored into disk.
        diffManager_1.diffManager.resetDiff(diffResetDate);
    }
    catch (e) {
        logger_1.logger.error(`Dump: error saving dump metadata to "${metadataFilepath}": ${e}`);
    }
};
exports.dumpManager = {
    dump(options = { incremental: true }) {
        const startDate = microtime_1.default.now();
        // Create a diff reset date just before consuming a diff.
        const diffResetDate = new Date();
        const diff = diffManager_1.diffManager.getDiff({ incremental: options.incremental });
        // Diff data is processed and transformed into a dump object.
        let dump = {
            since: diff.since,
            updated: new Map(),
            deleted: new Map(),
        };
        if (config_1.config.dumpDir) {
            const dumpDir = `${config_1.config.dumpDir}/files`;
            const metadataFilepath = `${config_1.config.dumpDir}/metadata.json`;
            if (diff.updated.size || diff.deleted.size) {
                // Store updated files.
                storeUpdatedFiles(diff, dump, dumpDir);
                // Remove deleted files.
                removeDeletedFiles(diff, dump, dumpDir);
                // Invoke "onDumpCreate" hook.
                const hookModulesInfo = hook_1.hookManager.getModuleGroupInfo();
                hookModulesInfo.forEach(hookInfo => {
                    const hookModule = hookInfo.getModule();
                    if (hookModule.onDumpCreate && config_1.config.dumpDir) {
                        dump = hookModule.onDumpCreate({
                            dataDir: config_1.config.dataDir,
                            dumpDir: config_1.config.dumpDir,
                            store: store_1.store,
                            dump,
                        });
                    }
                });
                // Merge and store dump metadata if any.
                if (dump.updated.size || dump.deleted.size) {
                    storeDumpMetadata(metadataFilepath, dump, diffResetDate);
                    logger_1.logger.info(`Dump created in ${(microtime_1.default.now() - startDate) / 1000} ms. Updated: ${dump.updated.size} / Deleted: ${dump.deleted.size}`);
                    // Log dump if not empty
                    if (dump.updated.size || dump.deleted.size) {
                        logger_1.logger.debug(`Dump: "${JSON.stringify((0, object_1.jsonify)(dump))}"`);
                    }
                }
                else {
                    logger_1.logger.info('Dump done without changes stored into disk.');
                }
            }
            else {
                logger_1.logger.info('Dump not stored into disk due to an empty diff.');
            }
        }
        else {
            logger_1.logger.error('"dumpDir" option not provided. Dump cannot be executed.');
        }
        return dump;
    },
    reset(timestamp) {
        if (config_1.config.dumpDir) {
            const metadataFilepath = `${config_1.config.dumpDir}/metadata.json`;
            const metadata = JSON.parse(fs_1.default.existsSync(metadataFilepath)
                ? fs_1.default.readFileSync(metadataFilepath).toString()
                : '[]');
            // Remove any dump data older that timestamp
            const resetMetadata = metadata.filter((dump) => dump.since > timestamp);
            logger_1.logger.debug(`Dump reset : "${JSON.stringify(resetMetadata)}"`);
            try {
                fs_1.default.writeFileSync(metadataFilepath, JSON.stringify(resetMetadata));
            }
            catch (e) {
                logger_1.logger.error(`Dump: error resetting dump metadata to "${metadataFilepath}": ${e}`);
            }
        }
        else {
            logger_1.logger.error('"dumpDir" option not provided. Dump reset cannot be executed.');
        }
    },
};

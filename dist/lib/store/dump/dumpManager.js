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
const dumpMetadataHelper_1 = require("./dumpMetadataHelper");
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
                        /*
                        fs.renameSync(
                          absoluteFilepathInDumpDir,
                          absoluteFilepathInDumpDir.replace('.json', '.2.json'),
                        );
                        */
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
                // Delete any empty directory.
                (0, fs_2.removeEmptyDirsUpwards)(path_1.default.dirname(absoluteFilepath));
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
exports.dumpManager = {
    dump(options = { incremental: true }) {
        const startDate = microtime_1.default.now();
        // Create a diff reset date just before consuming a diff.
        const diff = diffManager_1.diffManager.getDiff({ incremental: options.incremental });
        // Diff data is processed and transformed into a dump object.
        let dump = {
            execTimeMs: 0,
            fromUniqueId: diff.fromUniqueId,
            toUniqueId: diff.toUniqueId,
            updated: new Map(),
            deleted: new Map(),
        };
        if (config_1.config.dumpDir) {
            const dumpDir = `${config_1.config.dumpDir}/files`;
            if (diff.updated.size || diff.deleted.size) {
                // Store updated files.
                storeUpdatedFiles(diff, dump, dumpDir);
                // Remove deleted files.
                removeDeletedFiles(diff, dump, dumpDir);
                // Invoke "onDumpCreate" hook.
                dump = hook_1.hookManager.invokeOnDumpCreate(dump);
                const execTimeMs = (microtime_1.default.now() - startDate) / 1000;
                dump.execTimeMs = execTimeMs;
                // Merge and store dump metadata if any.
                if (dump.updated.size || dump.deleted.size) {
                    const storeSuccessful = dumpMetadataHelper_1.dumpMetadataHelper.storeDumpMetadata(dump);
                    if (storeSuccessful) {
                        // Resetting the diff must happen when dump metadata is successfully
                        // stored into disk.
                        diffManager_1.diffManager.reset(diff.toUniqueId);
                    }
                    logger_1.logger.info(`Dump created in ${execTimeMs} ms. Updated: ${dump.updated.size} / Deleted: ${dump.deleted.size}`);
                    // Log dump if not empty
                    if (dump.updated.size || dump.deleted.size) {
                        logger_1.logger.debug(`Dump: "${JSON.stringify((0, object_1.jsonify)(dump))}"`);
                    }
                }
                else {
                    // Resetting the diff must happen when no other operations are pending.
                    diffManager_1.diffManager.reset(diff.toUniqueId);
                    logger_1.logger.info(`Dump done in ${execTimeMs} ms without changes stored into disk.`);
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
    reset(uniqueId) {
        if (config_1.config.dumpDir) {
            const resetMetadata = dumpMetadataHelper_1.dumpMetadataHelper.removeDumpDataOlderThan(uniqueId);
            logger_1.logger.debug(`Dump reset : "${JSON.stringify(resetMetadata)}"`);
        }
        else {
            logger_1.logger.error('"dumpDir" option not provided. Dump reset cannot be executed.');
        }
    },
};

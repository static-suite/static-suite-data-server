"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const microtime_1 = __importDefault(require("microtime"));
const logger_1 = require("../../utils/logger");
const fs_2 = require("../../utils/fs");
const config_1 = require("../../config");
const store_1 = require("../store");
const diffManager_1 = require("../diff/diffManager");
const hook_1 = require("../hook");
const dumpMetadataHelper_1 = require("./dumpMetadataHelper");
const dumpIndexHelper_1 = require("./dumpIndexHelper");
const string_1 = require("../../utils/string");
const storeUpdatedFiles = (diff, dump, filesDumpDir) => {
    diff.updated.forEach(relativeFilepath => {
        const storeFileContentData = store_1.store.data.get(relativeFilepath);
        if (storeFileContentData) {
            const absoluteFilepathInDumpDir = `${filesDumpDir}/${relativeFilepath}`;
            try {
                // If store data is an object, stringify it to execute its
                // queries and resolve its includes.
                const isJson = (0, fs_2.isJsonFile)(relativeFilepath);
                const storeFileContentString = isJson
                    ? JSON.stringify(storeFileContentData)
                    : storeFileContentData;
                // Before overwriting a file, check if it has changed.
                let needsSave = true;
                let oldPublicUrl = null;
                const newPublicUrl = storeFileContentData.data?.content?.url?.path || null;
                const newHash = (0, string_1.createHash)(storeFileContentString);
                const indexEntry = dumpIndexHelper_1.dumpIndexHelper.getEntry(relativeFilepath);
                if (indexEntry) {
                    if (newHash === indexEntry.hash) {
                        // No need to save it, file has not changed.
                        needsSave = false;
                    }
                    else if (isJson) {
                        // Get old public URL before it changes on disk and index.
                        oldPublicUrl = indexEntry.url;
                    }
                }
                if (needsSave) {
                    // Create parent directories if they are missing.
                    const dir = path_1.default.dirname(absoluteFilepathInDumpDir);
                    if (!fs_1.default.existsSync(dir)) {
                        fs_1.default.mkdirSync(dir, { recursive: true });
                    }
                    // Save it on disk.
                    fs_1.default.writeFileSync(absoluteFilepathInDumpDir, storeFileContentString);
                    // Save it to index.
                    dumpIndexHelper_1.dumpIndexHelper.addEntry(relativeFilepath, {
                        hash: newHash,
                        url: newPublicUrl,
                    });
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
const removeDeletedFiles = (diff, dump, filesDumpDir) => {
    diff.deleted.forEach(relativeFilepath => {
        const absoluteFilepath = `${filesDumpDir}/${relativeFilepath}`;
        try {
            const indexEntry = dumpIndexHelper_1.dumpIndexHelper.getEntry(relativeFilepath);
            if (indexEntry) {
                // Get old public URLs before they change on disk and index.
                const oldPublicUrl = indexEntry.url;
                // Delete it.
                fs_1.default.unlinkSync(absoluteFilepath);
                // Delete any empty directory.
                (0, fs_2.removeEmptyDirsUpwards)(path_1.default.dirname(absoluteFilepath));
                // Delete it from index.
                dumpIndexHelper_1.dumpIndexHelper.removeEntry(relativeFilepath);
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
const removeStaleFiles = (diff, dump, filesDumpDir) => {
    const iterator = dumpIndexHelper_1.dumpIndexHelper.getKeys();
    for (const relativeFilepath of iterator) {
        const absoluteFilepath = `${filesDumpDir}/${relativeFilepath}`;
        if (!store_1.store.data.has(relativeFilepath) && fs_1.default.existsSync(absoluteFilepath)) {
            logger_1.logger.info(`Dump: removing stale file: ${relativeFilepath}`);
            try {
                // Get old public URLs before they change on disk.
                const dumpStaleFileString = fs_1.default
                    .readFileSync(absoluteFilepath)
                    .toString();
                const isJson = (0, fs_2.isJsonFile)(relativeFilepath);
                const dumpStaleFileContentData = isJson
                    ? JSON.parse(dumpStaleFileString)
                    : dumpStaleFileString;
                let oldPublicUrl = dumpStaleFileContentData.data?.content?.url?.path || null;
                // An stale file can be a manually copied file.
                // In that case, that stale file would have an oldPublicUrl from a valid file,
                // which would lead to deleting a valid URL.
                // To solve that case, check that oldPublicUrl is not a valid URL.
                if (oldPublicUrl && store_1.store.index.url.has(oldPublicUrl)) {
                    logger_1.logger.info(`Dump: skipping valid url from stale file: ${oldPublicUrl}`);
                    oldPublicUrl = null;
                }
                // Delete it.
                fs_1.default.unlinkSync(absoluteFilepath);
                // Delete any empty directory.
                (0, fs_2.removeEmptyDirsUpwards)(path_1.default.dirname(absoluteFilepath));
                // Delete it from index.
                dumpIndexHelper_1.dumpIndexHelper.removeEntry(relativeFilepath);
                // Mark it as deleted.
                dump.deleted.set(relativeFilepath, {
                    oldPublicUrl,
                    newPublicUrl: null,
                });
            }
            catch (e) {
                logger_1.logger.error(`Dump: error deleting stale file "${absoluteFilepath}": ${e}`);
            }
        }
    }
};
exports.dumpManager = {
    dump(options = { incremental: true }) {
        const startDate = microtime_1.default.now();
        // Diff data is processed and transformed into a dump object.
        const diff = diffManager_1.diffManager.getDiff({ incremental: options.incremental });
        let dump = {
            execTimeMs: 0,
            fromUniqueId: diff.fromUniqueId,
            toUniqueId: diff.toUniqueId,
            updated: new Map(),
            deleted: new Map(),
            diff,
        };
        if (config_1.config.dumpDir) {
            const filesDumpDir = `${config_1.config.dumpDir}/files`;
            if (diff.updated.size || diff.deleted.size) {
                dumpMetadataHelper_1.dumpMetadataHelper.storeDumpMetadata(dump);
                // Store updated files.
                storeUpdatedFiles(diff, dump, filesDumpDir);
                // Remove deleted files.
                removeDeletedFiles(diff, dump, filesDumpDir);
                // Remove stale files.
                removeStaleFiles(diff, dump, filesDumpDir);
                // Save dump index
                dumpIndexHelper_1.dumpIndexHelper.saveDumpIndex();
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

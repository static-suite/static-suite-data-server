"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpMetadataHelper = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../utils/logger");
const object_1 = require("../../utils/object");
const config_1 = require("../../config");
const workDir_1 = require("../workDir");
const getMetadataFilepath = () => `${config_1.config.dumpDir}/metadata.json`;
exports.dumpMetadataHelper = {
    storeDumpMetadata: (dump) => {
        const metadataFilepath = getMetadataFilepath();
        const fallbackDumpMetadata = {
            current: workDir_1.unixEpochUniqueId,
            dumps: [],
        };
        let currentDumpMetadata = fallbackDumpMetadata;
        try {
            currentDumpMetadata = JSON.parse(fs_1.default.readFileSync(metadataFilepath).toString());
        }
        catch (e) {
            currentDumpMetadata = fallbackDumpMetadata;
        }
        currentDumpMetadata.current = dump.toUniqueId;
        currentDumpMetadata.dumps.push((0, object_1.jsonify)(dump));
        try {
            const currentDumpMetadataString = JSON.stringify(currentDumpMetadata);
            fs_1.default.writeFileSync(metadataFilepath, currentDumpMetadataString);
            return true;
        }
        catch (e) {
            logger_1.logger.error(`Dump: error saving dump metadata to "${metadataFilepath}": ${e}`);
        }
        return false;
    },
    removeDumpDataOlderThan(uniqueId) {
        const metadataFilepath = getMetadataFilepath();
        const metadata = JSON.parse(fs_1.default.existsSync(metadataFilepath)
            ? fs_1.default.readFileSync(metadataFilepath).toString()
            : '[]');
        // Remove any dump data older than or equal to unique id.
        metadata.dumps = metadata.dumps.filter(dump => dump.toUniqueId > uniqueId);
        try {
            fs_1.default.writeFileSync(metadataFilepath, JSON.stringify(metadata));
        }
        catch (e) {
            logger_1.logger.error(`Dump: error removing dump metadata older than "${uniqueId}" from "${metadataFilepath}": ${e}`);
        }
        return metadata;
    },
    getCurrentDumpUniqueId() {
        const metadataFilepath = getMetadataFilepath();
        const metadata = JSON.parse(fs_1.default.existsSync(metadataFilepath)
            ? fs_1.default.readFileSync(metadataFilepath).toString()
            : '[]');
        return metadata.current || workDir_1.unixEpochUniqueId;
    },
};

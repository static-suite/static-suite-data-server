"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpMetadataManager = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("@lib/utils/logger");
const object_1 = require("@lib/utils/object");
const config_1 = require("@lib/config");
const getMetadataFilepath = () => `${config_1.config.dumpDir}/metadata.json`;
exports.dumpMetadataManager = {
    storeDumpMetadata: (dump) => {
        const metadataFilepath = getMetadataFilepath();
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
            return true;
        }
        catch (e) {
            logger_1.logger.error(`Dump: error saving dump metadata to "${metadataFilepath}": ${e}`);
        }
        return false;
    },
};

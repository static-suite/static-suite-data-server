"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpIndexHelper = void 0;
const fs_1 = __importDefault(require("fs"));
// import { logger } from '../../utils/logger';
// import { jsonify } from '../../utils/object';
const config_1 = require("../../config");
// import { Dump, DumpMetadata } from './dump.types';
// import { unixEpochUniqueId } from '../workDir';
// import { findFilesInDir } from '../../utils/fs';
const getIndexFilepath = () => `${config_1.config.dumpDir}/files.idx`;
exports.dumpIndexHelper = {
    isDumpIndexPresent: () => {
        const indexFilepath = getIndexFilepath();
        return fs_1.default.existsSync(indexFilepath);
    },
    createDumpIndex: () => {
        // const relativeFilePaths = findFilesInDir(config.dumpDir);
        // console.log('kkk relativeFilePaths', relativeFilePaths.length);
        /* const indexFilepath = getIndexFilepath();
        const fallbackDumpMetadata: DumpMetadata = {
          current: unixEpochUniqueId,
          dumps: [],
        };
        let currentDumpMetadata = fallbackDumpMetadata;
        try {
          currentDumpMetadata = JSON.parse(
            fs.readFileSync(indexFilepath).toString(),
          );
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          currentDumpMetadata = fallbackDumpMetadata;
        }
        currentDumpMetadata.current = dump.toUniqueId;
        currentDumpMetadata.dumps.push(jsonify(dump));
        try {
          const currentDumpMetadataString = JSON.stringify(currentDumpMetadata);
          fs.writeFileSync(indexFilepath, currentDumpMetadataString);
          return true;
        } catch (e) {
          logger.error(
            `Dump: error saving dump metadata to "${indexFilepath}": ${e}`,
          );
        }
        return false; */
    },
    /* removeDumpDataOlderThan(uniqueId: string): DumpMetadata {
      const metadataFilepath = getMetadataFilepath();
  
      const metadata = JSON.parse(
        fs.existsSync(metadataFilepath)
          ? fs.readFileSync(metadataFilepath).toString()
          : '[]',
      ) as DumpMetadata;
  
      // Remove any dump data older than or equal to unique id.
      metadata.dumps = metadata.dumps.filter(dump => dump.toUniqueId > uniqueId);
  
      try {
        fs.writeFileSync(metadataFilepath, JSON.stringify(metadata));
      } catch (e) {
        logger.error(
          `Dump: error removing dump metadata older than "${uniqueId}" from "${metadataFilepath}": ${e}`,
        );
      }
  
      return metadata;
    },
  
    getCurrentDumpUniqueId(): string {
      const metadataFilepath = getMetadataFilepath();
  
      logger.debug(`metadataFilepath: ${metadataFilepath}`);
      const metadata = JSON.parse(
        fs.existsSync(metadataFilepath)
          ? fs.readFileSync(metadataFilepath).toString()
          : '[]',
      ) as DumpMetadata;
  
      return metadata.current || unixEpochUniqueId;
    }, */
};

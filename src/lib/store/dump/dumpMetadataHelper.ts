import fs from 'fs';
import { logger } from '@lib/utils/logger';
import { jsonify } from '@lib/utils/object';
import { config } from '@lib/config';
import { Dump, DumpMetadata } from './dumpManager.types';
import { unixEpochUniqueId } from '../workDir';

const getMetadataFilepath = () => `${config.dumpDir}/metadata.json`;

export const dumpMetadataHelper = {
  storeDumpMetadata: (dump: Dump): boolean => {
    const metadataFilepath = getMetadataFilepath();
    const fallbackDumpMetadata: DumpMetadata = {
      current: unixEpochUniqueId,
      dumps: [],
    };
    let currentDumpMetadata = fallbackDumpMetadata;
    try {
      currentDumpMetadata = JSON.parse(
        fs.readFileSync(metadataFilepath).toString(),
      );
    } catch (e) {
      currentDumpMetadata = fallbackDumpMetadata;
    }
    currentDumpMetadata.current = dump.toUniqueId;
    currentDumpMetadata.dumps.push(jsonify(dump));
    try {
      const currentDumpMetadataString = JSON.stringify(currentDumpMetadata);
      fs.writeFileSync(metadataFilepath, currentDumpMetadataString);
      return true;
    } catch (e) {
      logger.error(
        `Dump: error saving dump metadata to "${metadataFilepath}": ${e}`,
      );
    }
    return false;
  },

  removeDumpDataOlderThan(uniqueId: string): DumpMetadata {
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

    const metadata = JSON.parse(
      fs.existsSync(metadataFilepath)
        ? fs.readFileSync(metadataFilepath).toString()
        : '[]',
    ) as DumpMetadata;

    return metadata.current || unixEpochUniqueId;
  },
};

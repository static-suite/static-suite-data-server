import fs from 'fs';
import path from 'path';
import microtime from 'microtime';
import { logger } from '@lib/utils/logger';
import { jsonify } from '@lib/utils/object';
import { getFileContent, isJsonFile, readFile } from '@lib/utils/fs';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { diffManager } from '../diff/diffManager';
import { Diff } from '../diff/diffManager.types';
import { Dump, DumpManager } from './dumpManager.types';

const removeEmptyDirsUpwards = (dir: string): void => {
  const isEmpty = fs.readdirSync(dir).length === 0;
  if (isEmpty) {
    try {
      fs.rmdirSync(dir);
    } catch (e) {
      logger.debug(`Error deleting empty directory "${dir}": ${e}`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    removeEmptyDirsUpwards(path.dirname(dir));
  }
};

const storeUpdatedFiles = (diff: Diff, dump: Dump, dumpDir: string): void => {
  diff.updated.forEach(relativeFilepath => {
    const storeFileContentData = store.data.get(relativeFilepath);
    if (storeFileContentData) {
      const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
      try {
        // Create parent directories if they are missing.
        const dir = path.dirname(absoluteFilepath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        // If store data is an object, stringify it to execute its
        // queries and resolve its includes.
        const isJson = isJsonFile(relativeFilepath);
        const storeFileContentString = isJson
          ? JSON.stringify(storeFileContentData)
          : storeFileContentData;

        // Before overwriting a file, check it has changed.
        let needsSave = true;
        if (fs.existsSync(absoluteFilepath)) {
          const dumpFileContentString = readFile(absoluteFilepath);
          if (storeFileContentString === dumpFileContentString) {
            // No need to save it, file has not changed.
            needsSave = false;
          } else if (isJson && dumpFileContentString) {
            // Track outdated public URLs.
            // Note that status changes (publishing or unpublishing a file) is meaningless for
            // Data Server. If an unpublished file must be used in an specific way, or even
            // deleted, that is something outside of the scope of Data Server.
            const storeFilePublicUrl: string | null =
              storeFileContentData.data?.content?.url?.path;
            const dumpFilePublicUrl: string | null = JSON.parse(
              dumpFileContentString,
            )?.data?.content?.url?.path;
            if (dumpFilePublicUrl && dumpFilePublicUrl !== storeFilePublicUrl) {
              dump.outdatedPublicUrls.add(dumpFilePublicUrl);
            }
          }
        }
        if (needsSave) {
          // Save it.
          fs.writeFileSync(absoluteFilepath, storeFileContentString);

          // Mark it as updated.
          dump.updated.add(relativeFilepath);
        }
      } catch (e) {
        logger.error(`Dump: error writing file "${absoluteFilepath}": ${e}`);
      }
    } else {
      logger.error(`Dump: data for file "${relativeFilepath}" not found.`);
    }
  });
};

const removeDeletedFiles = (diff: Diff, dump: Dump, dumpDir: string): void => {
  diff.deleted.forEach(relativeFilepath => {
    const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
    try {
      if (fs.existsSync(absoluteFilepath)) {
        // Track outdated public URLs.
        const dumpContent = getFileContent(absoluteFilepath);
        const dumpFilePublicUrl: string | null =
          dumpContent.json?.data?.content?.url?.path;
        if (dumpFilePublicUrl) {
          dump.outdatedPublicUrls.add(dumpFilePublicUrl);
        }

        // Delete it.
        fs.unlinkSync(absoluteFilepath);

        // Mark it as deleted.
        dump.deleted.add(relativeFilepath);
      }
    } catch (e) {
      logger.error(`Dump: error deleting file "${absoluteFilepath}": ${e}`);
    }
  });
};

const storeDumpMetadata = (
  metadataFilepath: string,
  dump: Dump,
  diffResetDate: Date,
) => {
  let currentDumpMetadata: Dump[] = [];
  try {
    currentDumpMetadata = JSON.parse(
      fs.readFileSync(metadataFilepath).toString(),
    );
  } catch (e) {
    currentDumpMetadata = [];
  }
  currentDumpMetadata.push(jsonify(dump));
  try {
    const currentDumpMetadataString = JSON.stringify(currentDumpMetadata);
    fs.writeFileSync(metadataFilepath, currentDumpMetadataString);
    // Resetting the diff must happen when dump metadata is successfully
    // stored into disk.
    diffManager.resetDiff(diffResetDate);
  } catch (e) {
    logger.error(
      `Dump: error saving dump metadata to "${metadataFilepath}": ${e}`,
    );
  }
};

export const dumpManager: DumpManager = {
  dump(options = { incremental: true }): Dump {
    const startDate = microtime.now();

    // Create a diff reset date just before consuming a diff.
    const diffResetDate = new Date();
    const diff = diffManager.getDiff({ incremental: options.incremental });

    // Diff data is processed and stored in a dump object.
    const dump: Dump = {
      since: diff.since,
      updated: new Set(),
      deleted: new Set(),
      outdatedPublicUrls: new Set(),
    };

    if (config.dumpDir) {
      const dumpDir = `${config.dumpDir}/files`;
      const metadataFilepath = `${config.dumpDir}/metadata.json`;

      if (diff.updated.size || diff.deleted.size) {
        // Store updated files.
        storeUpdatedFiles(diff, dump, dumpDir);

        // Remove deleted files.
        removeDeletedFiles(diff, dump, dumpDir);

        // Merge and store dump metadata if any.
        if (
          dump.updated.size ||
          dump.deleted.size ||
          dump.outdatedPublicUrls.size
        ) {
          storeDumpMetadata(metadataFilepath, dump, diffResetDate);

          logger.info(
            `Dump created in ${
              (microtime.now() - startDate) / 1000
            } ms. Updated: ${dump.updated.size} / Deleted: ${
              dump.deleted.size
            } / Outdated public URLs: ${dump.outdatedPublicUrls.size}`,
          );

          // Log dump if not empty
          if (dump.updated.size || dump.deleted.size) {
            logger.debug(`Dump: "${JSON.stringify(jsonify(dump))}"`);
          }
        } else {
          logger.info('Dump done without changes stored into disk.');
        }
      } else {
        logger.info('Dump not stored into disk due to an empty diff.');
      }
    } else {
      logger.error('"dumpDir" option not provided. Dump cannot be executed.');
    }

    return dump;
  },

  reset(timestamp: number): void {
    if (config.dumpDir) {
      const metadataFilepath = `${config.dumpDir}/metadata.json`;

      const metadata = JSON.parse(
        fs.existsSync(metadataFilepath)
          ? fs.readFileSync(metadataFilepath).toString()
          : '[]',
      );

      // Remove any dump data older that timestamp
      const resetMetadata = metadata.filter(
        (dump: Dump) => dump.since > timestamp,
      );

      logger.debug(`Dump reset : "${JSON.stringify(resetMetadata)}"`);

      try {
        fs.writeFileSync(metadataFilepath, JSON.stringify(resetMetadata));
      } catch (e) {
        logger.error(
          `Dump: error resetting dump metadata to "${metadataFilepath}": ${e}`,
        );
      }
    } else {
      logger.error(
        '"dumpDir" option not provided. Dump reset cannot be executed.',
      );
    }
  },
};

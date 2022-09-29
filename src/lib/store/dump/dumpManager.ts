import fs from 'fs';
import path from 'path';
import microtime from 'microtime';
import { logger } from '@lib/utils/logger';
import { jsonify } from '@lib/utils/object';
import {
  getFileContent,
  isJsonFile,
  readFile,
  removeEmptyDirsUpwards,
} from '@lib/utils/fs';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { diffManager } from '../diff/diffManager';
import { Diff } from '../diff/diff.types';
import { Dump, DumpManager } from './dumpManager.types';
import { hookManager } from '../hook';
import { dumpMetadataHelper } from './dumpMetadataHelper';

const storeUpdatedFiles = (diff: Diff, dump: Dump, dumpDir: string): void => {
  diff.updated.forEach(relativeFilepath => {
    const storeFileContentData = store.data.get(relativeFilepath);
    if (storeFileContentData) {
      const absoluteFilepathInDumpDir = `${dumpDir}/${relativeFilepath}`;
      try {
        // Create parent directories if they are missing.
        const dir = path.dirname(absoluteFilepathInDumpDir);
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
        let oldPublicUrl: string | null = null;
        const newPublicUrl: string | null =
          storeFileContentData.data?.content?.url?.path || null;
        if (fs.existsSync(absoluteFilepathInDumpDir)) {
          const dumpFileContentString = readFile(absoluteFilepathInDumpDir);
          if (storeFileContentString === dumpFileContentString) {
            // No need to save it, file has not changed.
            needsSave = false;
          } else if (isJson && dumpFileContentString) {
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
          fs.writeFileSync(absoluteFilepathInDumpDir, storeFileContentString);

          // Mark it as updated.
          dump.updated.set(relativeFilepath, {
            oldPublicUrl,
            newPublicUrl,
          });
        }
      } catch (e) {
        logger.error(
          `Dump: error writing file "${absoluteFilepathInDumpDir}": ${e}`,
        );
      }
    } else {
      logger.error(
        `Dump: store data for file "${relativeFilepath}" not found.`,
      );
    }
  });
};

const removeDeletedFiles = (diff: Diff, dump: Dump, dumpDir: string): void => {
  diff.deleted.forEach(relativeFilepath => {
    const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
    try {
      if (fs.existsSync(absoluteFilepath)) {
        // Get old public URLs before they change on disk.
        const dumpContent = getFileContent(absoluteFilepath);
        const oldPublicUrl: string | null =
          dumpContent.json?.data?.content?.url?.path;

        // Delete it.
        fs.unlinkSync(absoluteFilepath);

        // Delete any empty directory.
        removeEmptyDirsUpwards(path.dirname(absoluteFilepath));

        // Mark it as deleted.
        dump.deleted.set(relativeFilepath, {
          oldPublicUrl,
          newPublicUrl: null,
        });
      }
    } catch (e) {
      logger.error(`Dump: error deleting file "${absoluteFilepath}": ${e}`);
    }
  });
};

export const dumpManager: DumpManager = {
  dump(options = { incremental: true }): Dump {
    const startDate = microtime.now();

    // Create a diff reset date just before consuming a diff.
    const diff = diffManager.getDiff({ incremental: options.incremental });

    // Diff data is processed and transformed into a dump object.
    let dump: Dump = {
      execTimeMs: 0,
      fromUniqueId: diff.fromUniqueId,
      toUniqueId: diff.toUniqueId,
      updated: new Map(),
      deleted: new Map(),
    };

    if (config.dumpDir) {
      const dumpDir = `${config.dumpDir}/files`;

      if (diff.updated.size || diff.deleted.size) {
        // Store updated files.
        storeUpdatedFiles(diff, dump, dumpDir);

        // Remove deleted files.
        removeDeletedFiles(diff, dump, dumpDir);

        // Invoke "onDumpCreate" hook.
        dump = hookManager.invokeOnDumpCreate(dump);

        const execTimeMs = (microtime.now() - startDate) / 1000;
        dump.execTimeMs = execTimeMs;

        // Merge and store dump metadata if any.
        if (dump.updated.size || dump.deleted.size) {
          const storeSuccessful = dumpMetadataHelper.storeDumpMetadata(dump);
          if (storeSuccessful) {
            // Resetting the diff must happen when dump metadata is successfully
            // stored into disk.
            diffManager.reset(diff.toUniqueId);
          }

          logger.info(
            `Dump created in ${execTimeMs} ms. Updated: ${dump.updated.size} / Deleted: ${dump.deleted.size}`,
          );

          // Log dump if not empty
          if (dump.updated.size || dump.deleted.size) {
            logger.debug(`Dump: "${JSON.stringify(jsonify(dump))}"`);
          }
        } else {
          // Resetting the diff must happen when no other operations are pending.
          diffManager.reset(diff.toUniqueId);
          logger.info(
            `Dump done in ${execTimeMs} ms without changes stored into disk.`,
          );
        }
      } else {
        logger.info('Dump not stored into disk due to an empty diff.');
      }
    } else {
      logger.error('"dumpDir" option not provided. Dump cannot be executed.');
    }

    return dump;
  },

  reset(uniqueId): void {
    if (config.dumpDir) {
      const resetMetadata =
        dumpMetadataHelper.removeDumpDataOlderThan(uniqueId);
      logger.debug(`Dump reset : "${JSON.stringify(resetMetadata)}"`);
    } else {
      logger.error(
        '"dumpDir" option not provided. Dump reset cannot be executed.',
      );
    }
  },
};

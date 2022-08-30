import fs from 'fs';
import path from 'path';
import microtime from 'microtime';
import { logger } from '@lib/utils/logger';
import { config } from '@lib/config';
import { store } from '@lib/store';
import { includeDiffManager } from '../include/includeDiffManager';
import { Diff } from '../include/includeDiffManager.types ';
import { Dump, DumpManager } from './dumpManager.types';
import { hookManager } from '../hook';

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

const storeUpdatedFiles = (
  updated: Map<string, string>,
  dumpDir: string,
): void => {
  updated.forEach(
    (targetRelativeFilepath: string, sourceRelativeFilepath: string) => {
      const fileContent = store.data.get(sourceRelativeFilepath);
      if (fileContent) {
        const absoluteFilepath = `${dumpDir}/${targetRelativeFilepath}`;
        try {
          const dir = path.dirname(absoluteFilepath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(absoluteFilepath, JSON.stringify(fileContent));
        } catch (e) {
          logger.error(
            `Dump: error writing file "${sourceRelativeFilepath}" to "${absoluteFilepath}": ${e}`,
          );
        }
      } else {
        logger.error(
          `Dump: data for file "${targetRelativeFilepath}" not found.`,
        );
      }
    },
  );
};

const removeDeletedFiles = (
  deletedFiles: Set<string>,
  dumpDir: string,
): void => {
  deletedFiles.forEach((relativeFilepath: string) => {
    const absoluteFilepath = `${dumpDir}/${relativeFilepath}`;
    try {
      if (fs.existsSync(absoluteFilepath)) {
        fs.unlinkSync(absoluteFilepath);
      }
    } catch (e) {
      logger.error(
        `Dump: error deleting file "${relativeFilepath}" from "${absoluteFilepath}": ${e}`,
      );
    }
  });
};

const storeDiffMetadata = (
  metadataFilepath: string,
  diff: Diff,
  diffResetDate: Date,
) => {
  let currentDiffMetadata: Diff[] = [];
  try {
    currentDiffMetadata = JSON.parse(
      fs.readFileSync(metadataFilepath).toString(),
    );
  } catch (e) {
    currentDiffMetadata = [];
  }
  currentDiffMetadata.push(diff);
  try {
    const currentDiffMetadataString = JSON.stringify(currentDiffMetadata);
    fs.writeFileSync(metadataFilepath, currentDiffMetadataString);
    // Resetting the diff must happen when its metadata is successfully
    // stored into disk.
    includeDiffManager.resetDiff(diffResetDate);
  } catch (e) {
    logger.error(
      `Dump: error saving diff metadata to "${metadataFilepath}": ${e}`,
    );
  }
};

const createDumpFromDiff = (diff: Diff): Dump => {
  const dump: Dump = {
    since: diff.since,
    updated: new Map(),
    deleted: new Set(diff.deleted),
  };
  // By default, all files are dumped to the same filepath
  // where their original raw data is stored.
  diff.updated.forEach((relativeFilepath: string) => {
    dump.updated.set(relativeFilepath, relativeFilepath);
  });

  return dump;
};

export const dumpManager: DumpManager = {
  dump(): void {
    if (config.dumpDir) {
      const startDate = microtime.now();
      const dumpDir = `${config.dumpDir}/files`;
      const metadataFilepath = `${config.dumpDir}/diff-metadata.json`;

      // Create a dump object from a diff.
      const diffResetDate = new Date();
      const diff = includeDiffManager.getDiff();
      let dump = createDumpFromDiff(diff);

      // Invoke "onDump" hook.
      const hookModulesInfo = hookManager.getModuleGroupInfo();
      hookModulesInfo.forEach(hookInfo => {
        const hookModule = hookInfo.getModule();
        if (hookModule.onDump && config.dumpDir) {
          dump = hookModule.onDump({
            dataDir: config.dataDir,
            dumpDir: config.dumpDir,
            store,
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

        logger.info(
          `Dump created in ${
            (microtime.now() - startDate) / 1000
          } ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`,
        );
      } else {
        logger.info('Dump not created since it is empty.');
      }
    } else {
      logger.error('dumpDir option not provided. Dump cannot be executed.');
    }
  },
};

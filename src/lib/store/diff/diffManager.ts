import microtime from 'microtime';
import { logger } from '../../utils/logger';
import { store } from '../store';
import { DiffManager, Diff } from './diff.types';
import { dataDirManager } from '../dataDir/dataDirManager';
import { dependencyManager } from '../dependency/dependencyManager';
import { unixEpochUniqueId, workDirHelper } from '../workDir';
import { dumpMetadataHelper } from '../dump/dumpMetadataHelper';

let lastDiffUniqueId: string = unixEpochUniqueId;

export const diffManager: DiffManager = {
  reset(uniqueId: string): void {
    lastDiffUniqueId = uniqueId;
    dependencyManager.reset();
  },

  getDiff(options = { incremental: true }): Diff {
    const startDate = microtime.now();

    // Before getting any diff data, update any pending changes from data dir.
    const changedFiles = dataDirManager.update();

    const updated = new Set<string>();
    const deleted = new Set<string>();

    const currentDumpUniqueId = dumpMetadataHelper.getCurrentDumpUniqueId();
    const isFirstDiffAfterReboot = lastDiffUniqueId === unixEpochUniqueId;
    const isADumpAvailable = currentDumpUniqueId !== unixEpochUniqueId;
    // If both checks passes, check if something has changed after last dump to avoid a full diff:
    if (isFirstDiffAfterReboot && isADumpAvailable) {
      const dataDirModificationUniqueId = changedFiles.toUniqueId;
      if (currentDumpUniqueId === store.initialUniqueId) {
        // If nothing changed, use store.initialUniqueId as lastDiffUniqueId, to
        // execute an incremental dump.
        lastDiffUniqueId = store.initialUniqueId;
      } else {
        // If something changed, keep lastDiffUniqueId as is, and get the list of
        // changed files from last dump. From that list, we need deleted files, since
        // those files are no more in data dir and we need to remove them from dump dir.
        const changedFilesSinceLastDump = workDirHelper.getChangedFilesBetween(
          currentDumpUniqueId,
          dataDirModificationUniqueId,
        );
        changedFilesSinceLastDump.deleted.forEach(filepath =>
          deleted.add(filepath),
        );
      }
    }

    if (options.incremental && lastDiffUniqueId !== unixEpochUniqueId) {
      logger.debug(`Getting incremental diff using date "${lastDiffUniqueId}"`);
      const invalidatedFilepaths = dependencyManager.getInvalidatedFilepaths();
      invalidatedFilepaths.updated.forEach(filepath => updated.add(filepath));
      invalidatedFilepaths.deleted.forEach(filepath => deleted.add(filepath));
    } else {
      // Return all files
      logger.debug(`Getting full diff with no date`);
      Array.from(store.data.keys()).forEach(key => updated.add(key));
    }

    const execTimeMs = (microtime.now() - startDate) / 1000;

    const diff: Diff = {
      execTimeMs,
      fromUniqueId: lastDiffUniqueId,
      toUniqueId: changedFiles.toUniqueId,
      updated,
      deleted,
    };

    logger.info(
      `Diff created in ${execTimeMs} ms. Updated: ${diff.updated.size} / Deleted: ${diff.deleted.size}`,
    );

    // Log diff if not empty
    // if (diff.updated.length || diff.deleted.length) {
    // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
    // }

    return diff;
  },
};

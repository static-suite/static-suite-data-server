import microtime from 'microtime';
import { logger } from '@lib/utils/logger';
import { store } from '../store';
import { DiffManager, Diff } from './diffManager.types';
import { dataDirManager } from '../dataDir/dataDirManager';
import { dependencyManager } from '../dependency/dependencyManager';

let lastDiffDate: Date | null = null;

export const diffManager: DiffManager = {
  reset(date: Date): void {
    lastDiffDate = date;
    dependencyManager.reset();
  },

  getDiff(options = { incremental: true }): Diff {
    const startDate = microtime.now();

    // Before getting any diff data, update any pending changes from data dir.
    dataDirManager.update();

    let updated = new Set<string>();
    let deleted = new Set<string>();
    if (options.incremental && lastDiffDate) {
      logger.debug(`Getting incremental diff using date "${lastDiffDate}"`);
      const invalidatedFilepaths = dependencyManager.getInvalidatedFilepaths();
      updated = new Set<string>(invalidatedFilepaths.updated);
      deleted = new Set<string>(invalidatedFilepaths.deleted);
    } else {
      // If no sinceDate is passed, return all files
      logger.debug(`Getting full diff with no date`);
      updated = new Set<string>(store.data.keys());
    }

    const diff: Diff = {
      since: lastDiffDate ? lastDiffDate.getTime() : new Date(0).getTime(),
      updated,
      deleted,
    };

    logger.info(
      `Diff created in ${(microtime.now() - startDate) / 1000} ms. Updated: ${
        diff.updated.size
      } / Deleted: ${diff.deleted.size}`,
    );

    // Log diff if not empty
    // if (diff.updated.length || diff.deleted.length) {
    // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
    // }

    return diff;
  },

  /*
  getDiff(options = { incremental: true }): Diff {
    const startDate = microtime.now();

    // Before getting any diff data, update any pending changes from data dir.
    const changedFiles = dataDirManager.update();

    let updated = new Set<string>();
    let deleted = new Set<string>();
    const sinceDate = getLastDiffDate();
    if (options.incremental && sinceDate) {
      logger.debug(`Getting incremental diff using date "${sinceDate}"`);
      // Only process changedFiles if not empty.
      if (changedFiles.updated.length || changedFiles.deleted.length) {
        // Update tracked files so no affected parent is missed.
        changedFiles.updated.forEach(file => {
          tracker.trackChangedFile(file);
        });
        changedFiles.deleted.forEach(file => {
          tracker.trackChangedFile(file);
        });
      }

      // Create the resulting set of updated and deleted files.
      // "updated" includes all affected parents tracked down
      // by tracker, without any deleted file.
      updated = new Set<string>(tracker.getChangedFiles());
      changedFiles.deleted.forEach(file => updated.delete(file));

      // "deleted" includes only deleted files, and is based only
      // on data coming from changedFiles, because all deleted files
      // are stored on Static Suite Data Server log
      deleted = new Set<string>(changedFiles.deleted);

      // Add updated files affected by queries only if "updated" or "deleted"
      // contain any changes.
      if (updated.size > 0 || deleted.size > 0) {
        queryTagManager
          .getInvalidFilepaths()
          .forEach(file => updated.add(file));
        queryTagManager.resetInvalidatedTags();
      }
    } else {
      // If no sinceDate is passed, return all files
      logger.debug(`Getting full diff with no date`);
      updated = new Set<string>(store.data.keys());
    }

    const diff: Diff = {
      since: sinceDate ? sinceDate.getTime() : new Date(0).getTime(),
      updated,
      deleted,
    };

    logger.info(
      `Diff created in ${(microtime.now() - startDate) / 1000} ms. Updated: ${
        diff.updated.size
      } / Deleted: ${diff.deleted.size}`,
    );

    // Log diff if not empty
    // if (diff.updated.length || diff.deleted.length) {
    // logger.debug(`Diff: "${JSON.stringify(jsonify(diff))}"`);
    // }

    return diff;
  }, */
};

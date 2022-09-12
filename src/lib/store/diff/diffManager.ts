import os from 'os';
import fs from 'fs';
import path from 'path';
import microtime from 'microtime';
import { logger } from '@lib/utils/logger';
import { Json } from '@lib/utils/object/object.types';
import { store } from '../store';
import { config } from '../../config';
import { workDirHelper } from '../workDir';
import { DiffManager, Diff } from './diffManager.types';
import { dataDirManager } from '../dataDir/dataDirManager';
import { tracker } from './tracker';

let lastDiffDateFilepath: string | null = null;

let lastDiffDate: Date | null = null;

// Ensure several concurrent Data Servers use different files.
const getLastDiffDateFilepath = () => {
  if (!lastDiffDateFilepath) {
    const dataDirHash = config.dataDir
      .replace(/\//g, '-')
      .replace(/([^a-zA-Z0-9-])/g, '')
      .replace(/^-/g, '')
      .replace(/-$/g, '');
    lastDiffDateFilepath = `${os.homedir()}/.static-suite/data-server/${dataDirHash}/last-diff-date.dat`;
  }
  return lastDiffDateFilepath;
};

const getLastDiffDate = (): Date | null => {
  const lastDiffDatePath = getLastDiffDateFilepath();
  // The first time this function is executed (after Data Server is started for the first time),
  // it tries to get last diff date from previously stored value on disk.
  if (!lastDiffDate && fs.existsSync(lastDiffDatePath)) {
    try {
      const storedLastDiffDateAsTimestamp = fs
        .readFileSync(lastDiffDatePath)
        .toString()
        .trim();
      if (storedLastDiffDateAsTimestamp) {
        lastDiffDate = new Date(parseInt(storedLastDiffDateAsTimestamp, 10));
      }
    } catch (e) {
      logger.error(
        `Error reading diff metadata file located at "${lastDiffDateFilepath}": ${e}`,
      );
    }
  }

  return lastDiffDate;
};

const setLastDiffDate = (date: Date): void => {
  const lastDiffDatePath = getLastDiffDateFilepath();
  try {
    if (!fs.existsSync(lastDiffDatePath)) {
      fs.mkdirSync(path.dirname(lastDiffDatePath), { recursive: true });
    }
    fs.writeFileSync(lastDiffDatePath, date.getTime().toString());
  } catch (e) {
    logger.error(
      `Error writing diff metadata file located at ${`lastDiffDatePath`}: ${e}`,
    );
  }
  lastDiffDate = date;
};

const getUpdatedFilesByQueries = (): string[] => {
  // todo
  const updatedFilesByQueries: string[] = [];
  store.data.forEach((json: Json, relativeFilepath: string) => {
    if (json.metadata?.includes?.dynamic) {
      updatedFilesByQueries.push(relativeFilepath);
    }
  });
  return updatedFilesByQueries;
};

export const diffManager: DiffManager = {
  resetDiff(date: Date): void {
    setLastDiffDate(date);
    tracker.reset();
  },

  getDiff(options = { incremental: true }): Diff {
    const startDate = microtime.now();

    // Before getting any diff data, update any pending changes from data dir.
    dataDirManager.update();

    let updated = new Set<string>();
    let deleted = new Set<string>();
    const sinceDate = getLastDiffDate();
    logger.debug(`Getting diff using date "${sinceDate}"`);
    if (options.incremental && sinceDate) {
      // Only process changedFiles if not empty.
      const changedFiles = workDirHelper.getChangedFilesSince(sinceDate);
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
        getUpdatedFilesByQueries().forEach(file => updated.add(file));
      }
    } else {
      // If no sinceDate is passed, return all files
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
  },
};

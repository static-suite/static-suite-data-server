import os from 'os';
import fs from 'fs';
import path from 'path';
import { config } from '@lib/config';
import { logger } from '@lib/utils/logger';
import { jsonify } from '@lib/utils/object';
import { includeIndex } from '../include/includeIndex';
import { Tracker } from './tracker.types';

/**
 * A list of changed files with includes that have changed since last reset.
 */
const changedFiles = new Set<string>();

/**
 * A flag to tell wether getChangedFiles() has been already called.
 */
let isChangedFilesInitialized = false;

// Ensure several concurrent Data Servers use different files.
let trackerFilepath: string | null = null;
const getTrackerFilepath = () => {
  if (!trackerFilepath) {
    const dataDirHash = config.dataDir
      .replace(/\//g, '-')
      .replace(/([^a-zA-Z0-9-])/g, '')
      .replace(/^-/g, '')
      .replace(/-$/g, '');
    trackerFilepath = `${os.homedir()}/.static-suite/data-server/${dataDirHash}/tracker.json`;
  }
  return trackerFilepath;
};

export const tracker: Tracker = {
  trackChangedFile(relativeFilepath) {
    // Add parents.
    includeIndex
      .getParents(relativeFilepath)
      .forEach((parentRelativeFilepath: string) => {
        changedFiles.add(parentRelativeFilepath);
      });

    // Add the passed file.
    changedFiles.add(relativeFilepath);

    // Store memory data into disk
    const trackerFile = getTrackerFilepath();
    const dataToStore = JSON.stringify({ changedFiles: jsonify(changedFiles) });
    try {
      if (!fs.existsSync(trackerFile)) {
        fs.mkdirSync(path.dirname(trackerFile), { recursive: true });
      }
      fs.writeFileSync(trackerFile, dataToStore);
    } catch (e) {
      logger.error(
        `Error writing tracker file located at "${trackerFile}": ${e}`,
      );
    }
  },

  getChangedFiles: () => {
    const trackerFile = getTrackerFilepath();
    // The first time this function is executed (after Data Server is started for the first time),
    // it tries to get changed files from previously stored value on disk.
    if (!isChangedFilesInitialized && fs.existsSync(trackerFile)) {
      try {
        const trackerFileData = JSON.parse(
          fs.readFileSync(trackerFile).toString().trim(),
        );
        isChangedFilesInitialized = true;
        trackerFileData.changedFiles?.forEach((changedFile: string) =>
          changedFiles.add(changedFile),
        );
      } catch (e) {
        logger.error(
          `Error reading tracker file located at "${trackerFile}": ${e}`,
        );
      }
    }

    return Array.from(changedFiles);
  },

  reset: () => {
    changedFiles.clear();
    // Delete tracker file.
    const trackerFile = getTrackerFilepath();
    if (fs.existsSync(trackerFile)) {
      fs.unlinkSync(trackerFile);
    }
  },
};

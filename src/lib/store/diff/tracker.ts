import { includeIndex } from '../include/includeIndex';
import { Tracker } from './tracker.types';

/**
 * A list of changed files with includes that have changed since last reset.
 */
const changedFiles = new Set<string>();

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
  },

  getChangedFiles: () => Array.from(changedFiles),

  reset: () => {
    changedFiles.clear();
  },
};

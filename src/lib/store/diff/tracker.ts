import { includeIndex } from '../include/includeIndex';
import { Tracker } from './tracker.types';

const trackedChangedFiles = new Set<string>();

export const tracker: Tracker = {
  trackChangedFile(file: string): void {
    // Add parents.
    includeIndex.getParents(file).forEach((parent: string) => {
      trackedChangedFiles.add(parent);
    });
    // Add the passed file.
    trackedChangedFiles.add(file);
  },

  getChangedFiles: (): string[] => Array.from(trackedChangedFiles),

  reset: (): void => {
    trackedChangedFiles.clear();
  },
};

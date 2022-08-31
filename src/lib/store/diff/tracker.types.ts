/**
 * Track changed files affected by includes.
 */
export type Tracker = {
  /**
   * Gets a set of changed files from a file and adds them to a temporary stack.
   *
   * @remarks
   * Between two builds, stored data can be mutated when dataDirManager::update() runs. That
   * creates a problem when an include or file is removed, since once store is updated we cannot
   * go back in time to track past changes. To avoid this, track changes files whenever store
   * is updated.
   *
   * This function only tracks changed files affected by includes. There is no need to track
   * intermediate changes in query results, since they are evaluated in getDiff().
   *
   * @param file - Relative file path, inside dataDir, to the file to be processed.
   */
  trackChangedFile(file: string): void;

  /**
   * Gets the current set of changed files.
   *
   * @returns an array of changed files.
   */
  getChangedFiles(): string[];

  /**
   * Resets current set of changed files.
   */
  reset(): void;
};

export type DataDirManager = {
  /**
   * Loads all files inside the data directory into the store.
   *
   * @remarks
   * By default, it loads all files from disc and reads their contents, unless
   * options.incremental is set to true. In such case, it ask the work dir helper
   * for updated files, and reads data from disc only for those updated files.
   *
   * The only drawback of this approach is that data can be updated without
   * informing the work dir system (exporting data from Drupal using a batch process).
   * For such cases, Data Server should be completely restarted, or this function
   * should be called with `options.incremental = false`.
   *
   * @param options - Configuration options
   */
  load(options?: { incremental: boolean }): void;

  /**
   * Updates the store with changed files since last sync.
   *
   * @remarks
   * It's main difference with load() is that, instead of loading the whole store,
   * update() checks if something has changed, not doing anything if nothing
   * has changed. Thus, this method is way faster than load().
   *
   * @returns The store manager.
   */
  update(): void;

  /**
   * Get date of last modification of data directory.
   *
   * @remarks
   * Metadata about when and how is the data directory updated is
   * stored in the work directory. If that directory is not present or
   * not initialized with proper data, it returns the sync date of the store.
   * If the store is not yet loaded, it returns a date in the past,
   * the Unix Epoch (00:00:00 UTC on 1 January 1970).
   *
   * @returns The date of last modification of data directory
   */
  getModificationDate(): Date;
};

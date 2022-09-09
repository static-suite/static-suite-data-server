/**
 * Service that handles the incremental differences in data (includes and queries).
 */
export declare type DiffManager = {
    /**
     * Clears intermediate changes tracked by trackChangedFile().
     *
     * @param date - Date to be used as a timestamp for the next diff.
     */
    resetDiff(date: Date): void;
    /**
     * Gets a list of changed files affected by includes and queries.
     *
     * @remarks
     * This function does not need any date passed as argument to get a diff from.
     * It simply uses the timestamp of the last generated diff. Calling this function does
     * not automatically update that timestamp, because diff data must be stored in
     * disk (a process called "dump"). Once a dump is finished, we can use the new
     * timestamp for further diffs.
     *
     * To obtain a diff, we need changed files from:
     *
     * 1) includes: every time a file changes, all its parents are affected.
     * 2) queries: there is no easy way to know if a changed file will alter a query,
     *   so we run all of them and check if something has changed.
  
     * @param options - Configuration options
     */
    getDiff(options?: {
        incremental: boolean;
    }): Diff;
};
/**
 * A group of changed files in Static Suite's data dir.
 */
export declare type Diff = {
    /**
     * Timestamp in milliseconds.
     */
    since: number;
    /**
     * A list of updated files (both newly added and changed files).
     */
    updated: Set<string>;
    /**
     * A list of deleted files.
     */
    deleted: Set<string>;
};
//# sourceMappingURL=diffManager.types.d.ts.map
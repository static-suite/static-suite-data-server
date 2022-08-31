/**
 * Service that handles the incremental differences in data (includes and queries).
 */
export declare type DiffManager = {
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
     *
     * Note that status changes (publishing or unpublishing a file) is meaningless for
     * Data Server. If an unpublished file must be used in an specific way, or even
     * deleted, that is something outside of the scope of Data Server.
     *
     */
    getDiff(): Diff;
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
//# sourceMappingURL=diffManager.types%20.d.ts.map
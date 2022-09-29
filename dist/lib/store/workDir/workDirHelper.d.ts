import { ChangedFiles } from './workDir.types';
/**
 * The unique id of the Unix Epoch (00:00:00 UTC on 1 January 1970)
 */
export declare const unixEpochUniqueId = "1970-01-01_00-00-00.000000__0000";
export declare const workDirHelper: {
    /**
     * Gets unique id of last modification of work directory.
     *
     * @returns The unique id of last modification of work directory, or null if directory not found.
     */
    getModificationUniqueId: () => string | null;
    /**
     * Get changed files since a date.
     *
     * @param fromUniqueId - Date to search from.
     * @param toUniqueId - Date to search to.
     *
     * @returns Object with four properties:
     * - updated: array of changed files.
     * - deleted: array of deleted files.
     * - fromTimestamp
     * - toTimestamp
     */
    getChangedFilesBetween: (fromUniqueId: string, toUniqueId: string) => ChangedFiles;
};
//# sourceMappingURL=workDirHelper.d.ts.map
import { ChangedFiles } from './workDir.types';
export declare const workDirHelper: {
    /**
     * Gets date of last modification of work directory.
     *
     * @returns The date of last modification of work directory, or null if directory not found.
     */
    getModificationDate: () => Date | null;
    /**
     * Get changed files since a date.
     *
     * @param sinceDate - Date to search
     *
     * @returns Object with two properties:
     * - updated: array of changed files.
     * - deleted: array of deleted files.
     */
    getChangedFilesSince: (sinceDate: Date) => ChangedFiles;
};
//# sourceMappingURL=workDirHelper.d.ts.map
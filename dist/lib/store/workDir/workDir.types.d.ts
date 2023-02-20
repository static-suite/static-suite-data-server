/**
 * A group of changed files in Static Suite's data dir.
 */
export type ChangedFiles = {
    /**
     * A unique id representing the date from which those changes are obtained.
     */
    fromUniqueId: string;
    /**
     * A unique id representing the date until which those changes are obtained.
     */
    toUniqueId: string;
    /**
     * A list of updated files (both newly added and changed files).
     */
    updated: string[];
    /**
     * A list of deleted files.
     */
    deleted: string[];
};
/**
 * Information from a Static Suite's log line.
 */
export type LogLineData = {
    /**
     * The unique id of the write/delete operation from Static Suite.
     */
    uniqueId: string;
    /**
     * The type of operation executed in the log line.
     */
    operation: 'write' | 'delete';
    /**
     * Information about the affected file
     */
    file: {
        /**
         * File ID, a string identifying the file in a meaningful way, usually a numeric ID
         */
        id: string;
        /**
         * A long text identifying the file in a meaningful way, usually the content title.
         */
        label: string;
        /**
         * Relative file path inside data dir.
         */
        relativePath: string;
    };
};
//# sourceMappingURL=workDir.types.d.ts.map
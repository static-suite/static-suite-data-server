/**
 * Service that dumps resolved data (with resolved includes) into a dump directory.
 */
export declare type DumpManager = {
    /**
     * Dump resolved data (with resolved includes) into a dump directory.
     *
     * @remarks
     * Raw data stored in Data Server does not resolve its includes until
     * each file is consumed (and therefore stringified). A dump consumes
     * that raw data and stores it in a directory, along its metadata
     * (a list of changed/ deleted files), so a later process can store
     * those changes in another service like AWS S3.
     *
     * @param options - Configuration options
     */
    dump(options?: {
        incremental: boolean;
    }): Dump;
};
/**
 * A group of files to by dumped to dump directory.
 */
export declare type Dump = {
    /**
     * Timestamp in milliseconds.
     */
    since: number;
    /**
     * A list of updated files.
     */
    updated: Set<string>;
    /**
     * A list of deleted files.
     */
    deleted: Set<string>;
    /**
     * A list of outdated public URLs.
     *
     * Files usually specify the public URL that should be created from that source file.
     * That information is located at data.content.url.path. When that URL changes between
     * dumps, outdated URLs must be deleted. This set keeps a list of all outdated URLs that
     * must be deleted.
     */
    outdatedPublicUrls: Set<string>;
};
//# sourceMappingURL=dumpManager.types.d.ts.map
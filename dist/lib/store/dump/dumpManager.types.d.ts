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
     * Metadata is merged with previous existent metadata, so if a later sync
     * process crashes, next sync can take over that failed one.
     */
    dump(): void;
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
     * A list of updated files keyed by its path inside Data Server.
     *
     * Its value is the path inside the dump directory.
     */
    updated: Map<string, string>;
    /**
     * A list of deleted files.
     */
    deleted: Set<string>;
};
//# sourceMappingURL=dumpManager.types.d.ts.map
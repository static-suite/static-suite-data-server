import { Diff } from '../diff/diff.types';
/**
 * Service that dumps resolved data (with resolved includes) into a dump directory.
 */
export type DumpManager = {
    /**
     * Dump resolved data (with resolved includes) into a dump directory.
     *
     * @remarks
     * Raw data stored in Data Server does not resolve its includes until
     * each file is consumed (and therefore stringified). A dump consumes
     * that raw data and stores it in a directory, along its metadata
     * (a list of changed/deleted files), so a later process can store
     * those changes in another service like AWS S3.
     *
     * @param options - Configuration options
     */
    dump(options?: {
        incremental: boolean;
    }): Dump;
    /**
     * Reset dump metadata.
     *
     * @remarks
     * Resets dump metadata, removing any dump information older than the passed unique id.
     *
     * @param uniqueId - Unique id
     */
    reset(uniqueId: string): void;
};
/**
 * A group of files to by dumped to dump directory.
 */
export type Dump = {
    /**
     * Execution time taken by the dump, in milliseconds.
     */
    execTimeMs: number;
    /**
     * A unique id representing the date from which this dump is obtained.
     */
    fromUniqueId: string;
    /**
     * A unique id representing the date until which this dump is obtained.
     */
    toUniqueId: string;
    /**
     * A list of updated files, keyed by file path. Its value is an object with two keys,
     * old public URL and new public URL (the value stored at data.content.url.path) before
     * and after updating file in dumpDir.
     */
    updated: Map<string, {
        oldPublicUrl: string | null;
        newPublicUrl: string | null;
    }>;
    /**
     * A list of deleted files, keyed by file path. Its value is an object with two keys,
     * old public URL and new public URL (the value stored at data.content.url.path) before
     * and after updating file in dumpDir. New public URL is always null, since file is
     * deleted. We keep the same structure for both updated and deleted items.
     */
    deleted: Map<string, {
        oldPublicUrl: string | null;
        newPublicUrl: null;
    }>;
    /**
     * The diff used to generate this dump.
     */
    diff: Diff;
};
export type DumpMetadata = {
    current: string;
    dumps: Dump[];
};
//# sourceMappingURL=dump.types.d.ts.map
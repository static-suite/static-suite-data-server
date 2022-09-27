import { ChangedFiles } from '../workDir/workDir.types';
/**
 * A manager for the data dir from Static Suite.
 */
export declare type DataDirManager = {
    /**
     * Loads all files inside the data directory into the store.
     *
     */
    load(): void;
    /**
     * Updates the store with changed files since last sync.
     *
     * @remarks
     * It's main difference with load() is that, instead of loading the whole store,
     * update() checks if something has changed, not doing anything if nothing
     * has changed. Thus, this method is way faster than load().
     *
     * @returns A group of changed files in Static Suite's data dir.
     */
    update(): ChangedFiles;
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
//# sourceMappingURL=dataDir.types.d.ts.map
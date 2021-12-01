import { Store } from '@lib/store/store.types';
import { FileType } from '@lib/utils/fs/fs.types';
/**
 * Options passed to a hook.
 *
 * @remarks
 * Since hooks are user-land modules, they do not have access to configuration
 * or any other part of the Data Server. All data they need to function must be
 * passed as parameters.
 */
export declare type HookOptions = {
    /**
     * Path to the data directory.
     */
    dataDir: string;
    /**
     * Relative file path inside the data dir.
     */
    relativeFilepath: string;
    /**
     * Optional file contents, an object with "raw" and "json" members.
     */
    fileContent?: FileType;
    /**
     * The data store.
     */
    store: Store;
};
/**
 * A module that defines several hooks.
 */
export declare type HookModule = {
    /**
     * A hook executed before the store starts loading.
     *
     * @remarks
     * This hook is aimed at bootstrapping some data structure, or establishing some connection
     * to an external system before other hooks are run.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreLoadStart?(options: HookOptions): void;
    /**
     * A hook executed after a file is read from disk, before adding it to the store.
     *
     * @remarks
     * This hook is aimed at altering the contents of the file before it being added to the store.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     *
     * @returns The file contents, and object with "raw" and "json" members.
     */
    onProcessFile?(options: HookOptions): FileType;
    /**
     * A hook executed after a file is added into the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreItemAdd?(options: HookOptions): void;
    /**
     * A hook executed when a file is updated in the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreLoadDone?(options: HookOptions): void;
    /**
     * A hook executed before the store starts updating.
     *
     * @remarks
     * This hook is aimed at bootstrapping or updating some data structure
     * before a set of update/delete operations starts.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreUpdateStart?(options: HookOptions): void;
    /**
     * A hook executed when a file is updated in the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreItemUpdate?(options: HookOptions): void;
    /**
     * A hook executed after a file is removed from the store.
     *
     * @remarks
     * This hook is aimed at reverting the actions taken in storeAdd hook, e.g.- removing a file
     * from a taxonomy index.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreItemRemove?(options: HookOptions): void;
    /**
     * A hook executed after the store ends updating.
     *
     * @remarks
     * This hook is run after a set of update/delete operations finishes.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreUpdateDone?(options: HookOptions): void;
};
//# sourceMappingURL=hook.types.d.ts.map
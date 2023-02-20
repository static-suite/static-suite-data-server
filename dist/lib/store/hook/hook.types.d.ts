import { ConfigOptions } from '../../config/config.types';
import { Store } from '../store.types';
import { FileType } from '../../utils/fs/fs.types';
import { Logger } from '../../utils/logger/logger.types';
import { Json } from '../../utils/object/object.types';
import { DependencyTagger } from '../dependency/dependency.types';
import { Dump } from '../dump/dump.types';
import { ChangedFiles } from '../workDir/workDir.types';
/**
 * A manager for a group of user-land modules.
 *
 * @typeParam ModuleType - The type of module being managed.
 */
export type HookManager = {
    reset(): void;
    invokeOnStoreLoadStart(): void;
    invokeOnProcessFile(options: FileTypeHookOptions): FileType;
    invokeOnStoreItemAdd(options: StoreItemHookOptions): void;
    invokeOnStoreLoadDone(): void;
    invokeOnStoreChangeStart(changedFiles: ChangedFiles): void;
    invokeOnStoreItemBeforeUpdate(options: StoreItemHookOptions): void;
    invokeOnStoreItemAfterUpdate(options: StoreItemHookOptions): void;
    invokeOnStoreItemDelete(options: StoreItemHookOptions): void;
    invokeOnStoreChangeDone(changedFiles: ChangedFiles): void;
    invokeOnDumpCreate(dump: Dump): Dump;
};
/**
 * Options passed to an onModuleLoad hook.
 */
export interface OnModuleLoadHookOptions {
    /**
     * Configuration options.
     */
    config: ConfigOptions;
    /**
     * The data store.
     */
    store: Store;
    /**
     * The logger service.
     */
    logger: Logger;
}
/**
 * Options passed to a hook.
 *
 * @remarks
 * Since hooks are user-land modules, they do not have access to configuration
 * or any other part of the Data Server. All data they need to function must be
 * passed as parameters.
 */
export interface BaseHookOptions {
    /**
     * The data store.
     */
    store: Store;
    /**
     * The logger service.
     */
    logger: Logger;
    /**
     * The dependency tagger service.
     */
    dependencyTagger: DependencyTagger;
}
/**
 * Options passed to a store item hook.
 */
export interface StoreItemHookOptions {
    /**
     * Relative file path inside the data dir.
     */
    relativeFilepath: string;
    /**
     * Contents of the store item.
     */
    storeItem: Json | string | null;
    /**
     * Contents of the previous store item before store was updated.
     */
    previousStoreItem?: Json | string | null;
}
export interface FullStoreItemHookOptions extends StoreItemHookOptions, BaseHookOptions {
}
/**
 * Options passed to a file type hook.
 */
export interface FileTypeHookOptions {
    /**
     * Relative file path inside the data dir.
     */
    relativeFilepath: string;
    /**
     * File contents, an object with "raw" and "json" members.
     */
    fileContent: FileType;
}
export interface FullFileTypeHookOptions extends FileTypeHookOptions, BaseHookOptions {
}
export interface ChangedFilesHookOptions extends BaseHookOptions {
    /**
     * A group of changed files in Static Suite's data dir.
     */
    changedFiles: ChangedFiles;
}
export interface OnDumpHookOptions {
    /**
     * Path to the dump directory.
     */
    dumpDir: string;
    /**
     * The data store.
     */
    store: Store;
    /**
     * The dump to be processed.
     */
    dump: Dump;
}
/**
 * A module that defines several hooks.
 */
export type HookModule = {
    /**
     * A hook executed when a hook module is loaded or reloaded.
     *
     * @remarks
     * This hook is aimed at bootstrapping some data structure, or establishing some connection
     * to an external system before other hooks are run.
     */
    onModuleLoad?(options: OnModuleLoadHookOptions): void;
    /**
     * A hook executed before the store starts loading.
     *
     * @remarks
     * This hook is aimed at bootstrapping some data structure, or establishing some connection
     * to an external system before other hooks are run.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreLoadStart?(options: BaseHookOptions): void;
    /**
     * A hook executed after a file is read from disk, before adding it to the store.
     *
     * @remarks
     * This hook is aimed at altering the contents of the file before it being added to the store.
     *
     * @param options - An object with options passed to the hook. @see {@link FullFileTypeHookOptions}
     *
     * @returns The file contents, an object with "raw" and "json" members.
     */
    onProcessFile?(options: FullFileTypeHookOptions): FileType;
    /**
     * A hook executed after a file is added into the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link StoreItemHookOptions}
     */
    onStoreItemAdd?(options: FullStoreItemHookOptions): void;
    /**
     * A hook executed after the store finishes loading.
     *
     * @remarks
     * This hook is aimed at adding some final information to the store, e.g.- counting all images, etc
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreLoadDone?(options: BaseHookOptions): void;
    /**
     * A hook executed before the store starts updating.
     *
     * @remarks
     * This hook is aimed at bootstrapping or updating some data structure
     * before a set of update/delete operations starts.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreChangeStart?(options: ChangedFilesHookOptions): void;
    /**
     * A hook executed before a file is updated in the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link StoreItemHookOptions}
     */
    onStoreItemBeforeUpdate?(options: FullStoreItemHookOptions): void;
    /**
     * A hook executed after a file is updated in the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link StoreItemHookOptions}
     */
    onStoreItemAfterUpdate?(options: FullStoreItemHookOptions): void;
    /**
     * A hook executed after a file is deleted from the store.
     *
     * @remarks
     * This hook is aimed at reverting the actions taken in storeAdd hook, e.g.- removing a file
     * from a taxonomy index.
     *
     * @param options - An object with options passed to the hook. @see {@link StoreItemHookOptions}
     */
    onStoreItemDelete?(options: FullStoreItemHookOptions): void;
    /**
     * A hook executed after the store ends updating.
     *
     * @remarks
     * This hook is run after a set of update/delete operations finishes.
     *
     * @param options - An object with options passed to the hook. @see {@link HookOptions}
     */
    onStoreChangeDone?(options: ChangedFilesHookOptions): void;
    /**
     * A hook executed after a dump object is created.
     *
     * @remarks
     * This hook can alter the contents of the dump being saved, and add/remove items.
     *
     * @param options - An object with options passed to the hook. @see {@link OnDumpHookOptions}
     */
    onDumpCreate?(options: OnDumpHookOptions): Dump;
};
//# sourceMappingURL=hook.types.d.ts.map
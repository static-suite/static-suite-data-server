import { ConfigOptions } from '@lib/config/config.types';
import { Store } from '@lib/store/store.types';
import { FileType } from '@lib/utils/fs/fs.types';
import { DependencyTagger } from '../dependency/dependency.types';
import { Dump } from '../dump/dumpManager.types';
import { ChangedFiles } from '../workDir/workDir.types';
/**
 * A manager for a group of user-land modules.
 *
 * @typeParam ModuleType - The type of module being managed.
 */
export declare type HookManager = {
    reset(): void;
    invokeOnStoreLoadStart(): void;
    invokeOnProcessFile(options: FileHookOptions): FileType;
    invokeOnStoreItemAdd(options: FileHookOptions): void;
    invokeOnStoreLoadDone(): void;
    invokeOnStoreChangeStart(changedFiles: ChangedFiles): void;
    invokeOnStoreItemBeforeUpdate(options: FileHookOptions): void;
    invokeOnStoreItemAfterUpdate(options: FileHookOptions): void;
    invokeOnStoreItemDelete(options: FileHookOptions): void;
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
     * The dependency tagger service.
     */
    dependencyTagger: DependencyTagger;
}
/**
 * Options passed to a file hook.
 */
export interface FileHookOptions {
    /**
     * Relative file path inside the data dir.
     */
    relativeFilepath: string;
    /**
     * File contents, an object with "raw" and "json" members.
     */
    fileContent: FileType;
}
/**
 * Full options passed to a hook.
 */
export interface FullHookOptions extends BaseHookOptions, FileHookOptions {
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
export declare type HookModule = {
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
     * @param options - An object with options passed to the hook. @see {@link FileHookOptions}
     *
     * @returns The file contents, and object with "raw" and "json" members.
     */
    onProcessFile?(options: FullHookOptions): FileType;
    /**
     * A hook executed after a file is added into the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link FileHookOptions}
     */
    onStoreItemAdd?(options: FullHookOptions): void;
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
     * @param options - An object with options passed to the hook. @see {@link FileHookOptions}
     */
    onStoreItemBeforeUpdate?(options: FullHookOptions): void;
    /**
     * A hook executed after a file is updated in the store.
     *
     * @remarks
     * This hook is aimed at adding some information to the store, e.g.- indexing all contents
     * by their taxonomy.
     *
     * @param options - An object with options passed to the hook. @see {@link FileHookOptions}
     */
    onStoreItemAfterUpdate?(options: FullHookOptions): void;
    /**
     * A hook executed after a file is deleted from the store.
     *
     * @remarks
     * This hook is aimed at reverting the actions taken in storeAdd hook, e.g.- removing a file
     * from a taxonomy index.
     *
     * @param options - An object with options passed to the hook. @see {@link FileHookOptions}
     */
    onStoreItemDelete?(options: FullHookOptions): void;
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
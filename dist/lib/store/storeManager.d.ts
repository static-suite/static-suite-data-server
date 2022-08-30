import { StoreManager } from './store.types';
/**
 * Tells whether a watcher for hooks is enabled.
 *
 * @remarks
 * Files from data dir are not read again once data dir is loaded
 * during bootstrap, except when:
 * 1) A file is updated: only that file is read form data dir.
 * 2) A watcher detects a hook change: all files in data dir are read again.
 *
 * For the second case, we want to avoid having to actually read all
 * files from disk if they have not changed. To do so, there is a
 * file cache that caches the file raw contents. That cache uses a lot of
 * memory, and should only be enabled when run mode is DEV (hence, a watcher
 * is enabled) and a hook directory is defined.
 *
 * @returns True if hook watcher is enabled.
 */
export declare const isHookWatcherEnabled: () => boolean;
export declare const storeManager: StoreManager;
//# sourceMappingURL=storeManager.d.ts.map
/**
 * Initializes a watcher on any file inside queryDir, hookDir and taskDir.
 *
 * @remarks
 * If runMode is DEV and queryDir, hookDir and/or taskDir are defined by current
 * configuration, a watcher is initialized on them.
 *
 * When something changes inside query directory:
 * 1) Remove all modules inside the query directory, so they are required again.
 * 2) Clear the query cache, since that is not done by the queryManager.
 *
 * When something changes inside hook directory:
 * 1) Remove all modules inside the hook directory, so they are required again.
 * 2) Reload the whole data directory so hooks can be reapplied (this implies clearing the query cache).
 */
export declare const initWatcher: () => void;
//# sourceMappingURL=watcher.d.ts.map
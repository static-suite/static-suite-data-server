/**
 * Initializes a watcher on any file inside queryDir and hookDir.
 *
 * @remarks
 * If runMode is DEV and queryDir and/or hookDir are defined by current
 * configuration, a watcher is initialized on them.
 *
 * When something changes inside query directory:
 * 1) Remove all modules inside the query directory, so they are required again.
 * 2) Clear the query cache.
 *
 * When something changes inside hook directory:
 * 1) Remove all modules inside the hook directory, so they are required again.
 * 2) Reload the whole data directory so hooks can be reapplied.
 * 3) Clear the query cache.
 */
export declare const initWatcher: () => void;
//# sourceMappingURL=watcher.d.ts.map
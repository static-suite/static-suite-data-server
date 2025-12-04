/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @remarks
 * It handles three different events: add, change and unlink
 *
 * @param paths - An array of paths to be watched
 * @param listeners - An object with three optional event keys (add, change and unlink)
 * and a listener function as value. That function will be executed once any of
 * the event keys is dispatched.
 */
export declare const watch: (paths: string[], listeners: Record<"add" | "change" | "unlink", (filePath: string) => void>) => void;
//# sourceMappingURL=fsWatchUtils.d.ts.map
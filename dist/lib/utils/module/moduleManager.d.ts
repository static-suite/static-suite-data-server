/**
 * Module system that manages the caching of modules.
 *
 * @remarks
 * Modules are cached by Node.js when they are required. This module handler
 * is able to remove them from Node.js cache and reload them from scratch.
 *
 * This manager is aimed at handling "user-land" modules, i.e.- modules managed
 * by users and not part of the Data Server core. Those "user-land" modules are
 * queries and hooks, so trying to manage other kind of module will throw and error.
 */
export declare const moduleManager: {
    /**
     * Loads a module from scratch
     *
     * @remarks
     * Removes a module from Node.js cache, and loads it from scratch.
     * If the module is not valid or not found, it logs an error and throws
     * an exception.
     *
     * @param modulePath - Path to the module to be loaded
     * @typeParam Type - Type of the module to be loaded
     *
     * @returns - The requested module
     *
     * @throws
     * An exception if the module is not valid or it cannot be loaded.
     */
    load: <Type>(modulePath: string) => Type;
    /**
     * Removes a single module from Node.js cache
     *
     * @param modulePath - Path to the module to be removed
     * @param options - Object of options:
     * useLogger: Flag to use logger or not. Useful to avoid
     * "remove" log lines when this function is called from
     * other functions.
     */
    remove: (modulePath: string, options?: {
        useLogger: boolean;
    }) => void;
    /**
     * Removes several modules from Node.js cache at once
     *
     * @param regex - Regular expression to be tested again cached modules path
     */
    removeAll: (regex: RegExp) => void;
    /**
     * Gets a module from cache or loads it from scratch
     *
     * @remarks
     * If module is not found, logs an error and throws an exception.
     *
     * @param modulePath - Path to the module to be loaded
     * @typeParam Type - Type of the module to be loaded
     *
     * @returns - The requested module
     *
     * @throws
     * An exception if the module cannot be loaded.
     */
    get: <Type_1>(modulePath: string) => Type_1;
};
//# sourceMappingURL=moduleManager.d.ts.map
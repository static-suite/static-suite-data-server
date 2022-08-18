import { RunMode } from '@lib/dataServer.types';
/**
 * Configuration options.
 */
export declare type ConfigOptions = {
    /**
     * Path to the directory where data is stored.
     */
    dataDir: string;
    /**
     * Path to the directory where work data is stored. Optional.
     */
    workDir?: string;
    /**
     * Path to the directory where queries are stored. Optional.
     */
    queryDir?: string;
    /**
     * Path to the directory where hooks are stored. Optional.
     */
    hookDir?: string;
    /**
     * Path to the directory where tasks are stored. Optional.
     */
    taskDir?: string;
    /**
     * Run mode (dev or prod).
     */
    runMode: RunMode;
};
/**
 * Non-sanitized configuration options.
 *
 * @remarks
 * Options received by Data Server before validating them. They are the same as
 * {@link ConfigOptions} but with an optional runMode.
 *
 * @see {@link ConfigOptions}
 */
export declare type NonSanitizedConfigOptions = {
    /**
     * Path to the directory where data is stored.
     */
    dataDir: string;
    /**
     * Path to the directory where work data is stored. Optional.
     */
    workDir?: string;
    /**
     * Path to the directory where queries are stored. Optional.
     */
    queryDir?: string;
    /**
     * Path to the directory where hooks are stored. Optional.
     */
    hookDir?: string;
    /**
     * Path to the directory where tasks are stored. Optional.
     */
    taskDir?: string;
    /**
     * Run mode (dev or prod).
     */
    runMode?: RunMode;
};
//# sourceMappingURL=config.types.d.ts.map
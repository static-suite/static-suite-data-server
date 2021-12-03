import { ConfigOptions, NonSanitizedConfigOptions } from './config.types';
declare const config: ConfigOptions;
/**
 * Configures the data server.
 *
 * @remarks
 * It validates provided configuration and returns a sanitized and immutable
 * configuration object. It throws several errors if validation is not passing.
 *
 * @param options - Configuration options, @see {@link ConfigOptions}
 *
 * @returns - The sanitized and immutable configuration object.
 *
 * @throws {@link MissingRequiredOption}
 * Exception thrown if the dataDir or runMode are not provided.
 *
 * @throws {@link MissingDirectory}
 * Exception thrown if any of the provided paths (dataDir, workDir,
 * queryDir or hookDir) is not found.
 *
 * @throws {@link InvalidRunMode}
 * Exception thrown if runMode is not valid.
 */
declare const setConfig: (options: NonSanitizedConfigOptions) => ConfigOptions;
export { config, setConfig };
//# sourceMappingURL=config.d.ts.map
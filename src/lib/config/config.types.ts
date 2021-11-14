import { RunMode } from '@lib/dataServer.types';

/**
 * Configuration options.
 *
 * @param dataDir - Path to the directory where data is stored.
 * @param workDir - Path to the directory where work data is stored. Optional.
 * @param queryDir - Path to the directory where queries are stored. Optional.
 * @param hookDir - Path to the directory where hooks are stored. Optional.
 * @param runMode - Run mode (dev or prod).
 */
export type ConfigOptions = {
  dataDir: string;
  workDir?: string;
  queryDir?: string;
  hookDir?: string;
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
export type NonSanitizedConfigOptions = OptionalProps<ConfigOptions, 'runMode'>;

/**
 * Makes a property from a type optional.
 */
export type OptionalProps<Type extends unknown, Key extends keyof Type> = {
  [TK in keyof Type]: TK extends Key ? Optional<Type[TK]> : Type[TK];
};

/**
 * Makes all properties of a type optional.
 */
export type Optional<Type> = {
  [Property in keyof Type]+?: Type[Property];
};

import { Options as fastGlobOptions } from 'fast-glob';
import { FileType, GetFileContentOptions } from './fs.types';
/**
 * Tells whether a path is JSON or not.
 *
 * @remarks
 * A fast checker that avoids reading the contents of a file, or doing
 * some other complex operation to determine if a file contains JSON data.
 *
 * @internal
 */
export declare const isJsonFile: (filepath: string) => boolean;
/**
 * Reads a file and logs an error on failure.
 *
 * @param filePath - A path to a file.
 *
 * @returns The file contents as a string if file is found, or null otherwise.
 */
export declare const readFile: (filePath: string) => string | null;
/**
 * Gets raw and JSON parsed content from a file.
 *
 * @param filepath - A path to a file.
 *
 * @returns Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
 */
export declare const getFileContent: (filepath: string, options?: GetFileContentOptions) => FileType;
/**
 * Finds all files inside a directory
 *
 * @param dir - Absolute path to the directory to be scanned
 * @param glob - Optional glob to filter results (default all files recursive '**\/*')
 * @param options - Options for the fast-glob package.
 * See https://www.npmjs.com/package/fast-glob for reference .
 *
 * @returns Array of file paths found inside directory
 */
export declare const findFilesInDir: (dir: string, glob?: string, options?: fastGlobOptions) => string[];
/**
 * Gets a file's modification date and logs an error on failure.
 *
 * @param filePath - Path to the file
 *
 * @returns The file's modification date as a Date object, or null on error
 */
export declare const getModificationDate: (filePath: string) => Date | null;
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
//# sourceMappingURL=fsUtils.d.ts.map
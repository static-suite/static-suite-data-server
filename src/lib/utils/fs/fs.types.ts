import { Json } from '../object/object.types';

/**
 * An object that represents a file's contents.
 *
 * @remarks
 * Object with two properties, "raw" and "json", which contain
 * the raw and json version of the file. If file is not a JSON, the "json"
 * property is null. If file is not found, both properties are null.
 */
export type FileType = {
  /**
   * The raw contents of the file, as a string. Null if file is not found.
   */
  raw: string | null;

  /**
   * The file contents parsed as JSON, if file is a JSON file. Null if not a JSON file.
   */
  json: Json | null;
};

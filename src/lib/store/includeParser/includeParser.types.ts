import { Json } from '@lib/utils/string/string.types';

/**
 * Structure where metadata about includes can be found.
 */
export type IncludeMetadata = {
  /**
   * Optional structure for metadata includes.
   */
  metadata?: {
    /**
     * Optional array for metadata includes.
     *
     * @remarks
     * Every include path is stored in this array, so they can be
     * easily accessed.
     *
     * @example
     * ```
     * "metadata": {
     *  "includes": [
     *	  "data.content.author.entity.entityInclude",
     *	  "data.content.image.entity.entityInclude",
     *	  "data.content.queryInclude"
     *  ]
     * }
     * ```
     */
    includes?: Array<string>;
  };
};

/**
 * A JSON file with optional include metadata.
 */
export type JsonIncludeMetadata = Json & IncludeMetadata;

type EntityDataContent = {
  data: any;
};

export type IncludeParser = {
  /**
   * Parse all static includes (entity, config, locale and custom).
   *
   * @param fileContent - String to be parsed.
   */
  static(fileContent: JsonIncludeMetadata): void;

  /**
   * Parse all dynamic includes (queryInclude at this moment)
   *
   * @param fileContent - String to be parsed.
   */
  dynamic(fileContent: JsonIncludeMetadata): void;
};

export type IncludeParserOptions = {
  fileContent: Json;
  includeData: Json | EntityDataContent;
  mountPointPath: string[];
  includeKey: string;
};

export type EntityIncludeParserOptions = {
  fileContent: Json;
  includeData: Json | EntityDataContent;
  mountPointPath: string[];
};

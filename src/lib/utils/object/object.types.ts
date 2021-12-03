/**
 * Structure where a content's data and metadata os hold.
 *
 * @remarks
 * This type describes any JSON object, which can contain any data, but
 * it is usually structured this way:
 *
 * @example
 * ```
 * {
 *  "data": {
 *    "content": {
 *      ...,
 *    }
 *  }
 *  "metadata": {
 *    "includes": [
 *	    "data.content.author.entity.entityInclude",
 *	    "data.content.image.entity.entityInclude",
 *	    "data.content.queryInclude"
 *    ]
 *  }
 * }
 * ```
 */
export type Json = {
  [key: string]: any;

  /**
   * Optional structure for a content's data.
   */
  data?: {
    [key: string]: any;
    /**
     * Optional object that holds the fields of a Drupal content.
     */
    content?: Record<string, any>;
  };

  /**
   * Optional structure for metadata includes.
   */
  metadata?: {
    [key: string]: any;
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
     *    "static": [
     *	    "data.content.author.entity.entityInclude",
     *	    "data.content.image.entity.entityInclude",
     *    ]
     *    "dynamic": [
     *	    "data.content.queryInclude"
     *    ]
     *  ]
     * }
     * ```
     */
    includes?: {
      static?: Array<string>;
      dynamic?: Array<string>;
    };
  };
};

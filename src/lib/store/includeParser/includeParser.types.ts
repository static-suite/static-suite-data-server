import { Json } from '@lib/utils/object/object.types';

/**
 * Global parser that is able to parse static and dynamic includes.
 */
export type IncludeParser = {
  /**
   * Parse all static includes (entity, config, locale and custom).
   *
   * @param host - Object that will host a pointer to a target.
   */
  static(host: Json): void;

  /**
   * Parse all dynamic includes (queryInclude at this moment)
   *
   * @param host - Object that will host a pointer to a target.
   */
  dynamic(host: Json): void;
};

/**
 * Option to be passed a generic include parser (except entity and query includes).
 */
export type GenericIncludeParserOptions = {
  /**
   * Object that will host a pointer to a target.
   */
  host: Json;

  /**
   * Target that will be referenced from a host.
   *
   * @remarks
   * It can be any kind of data (object, string, array, int, etc), so we can not
   * assume this is going to be an object.
   *
   * For example, custom includes can point to a string file, or query includes
   * can return an error as a string.
   *
   * The only include that can ensure that its target is an object is entity include.
   */
  target: unknown;

  /**
   * Array of items to the mount point inside the host object, minus the last item (e.g.- ['data', 'content']).
   */
  mountPath: string[];

  /**
   * Last item of the mount point, that defines the key used to specify the include  (e.g.- "configInclude").
   */
  includeKey: string;
};

/**
 * Option to be passed an entity include parser.
 */
export type EntityIncludeParserOptions = {
  /**
   * Object that will host a pointer to a target.
   */
  host: Json;

  /**
   * Entity object that will be referenced from a host.
   *
   * @remarks
   * Since entity includes work only with entity data, we are
   * sure that this is an object.
   */
  target: Json;

  /**
   * Array of items to the mount point inside the host object, minus the last item (e.g.- ['data', 'content']).
   */
  mountPath: string[];

  /**
   * Last item of the mount point, that defines the key used to specify the include  (e.g.- "configInclude").
   */
  includeKey: string;
};

/**
 * Option to be passed a query include parser.
 */
export type QueryIncludeParserOptions = {
  /**
   * Object that will host a pointer to a target.
   */
  host: Json;

  /**
   * Full string of items to the mount point inside the host object.
   */
  includePath: string;
};

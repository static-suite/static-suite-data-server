type ObjectType = Record<string, unknown>;

/**
 * Checks if one object contains any key
 *
 * @param object - An object
 *
 * @returns true if the object has not any key, false otherwise.
 */
export const isEmptyObject = (object: ObjectType): boolean =>
  Object.keys(object).length === 0;

/**
 * Checks if one object contains a key
 *
 * @param object - An object
 * @param key - A key
 *
 * @returns true if the object has the given key, false otherwise.
 */
export const hasKey = <O>(object: O, key: PropertyKey): key is keyof O => {
  return key in object;
};

/**
 * Gets one clone of one object without references to nested objects
 *
 * @param object - An object
 *
 * @returns An identical object without references.
 */
export const deepClone = (object: ObjectType): ObjectType =>
  JSON.parse(JSON.stringify(object));

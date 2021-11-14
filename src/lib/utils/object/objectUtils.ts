export type ObjectType = Record<string, unknown>;

/**
 * Checks if an object is empty (i.e.- contains zero keys)
 *
 * @param object - An object
 *
 * @returns True if the object contains zero keys, false otherwise.
 */
export const isEmptyObject = (object: ObjectType): boolean =>
  Object.keys(object).length === 0;

/**
 * Checks if an object contains a key
 *
 * @param object - An object
 * @param key - The name of a key
 *
 * @returns True if the object has the given key, false otherwise.
 */
export const hasKey = <O>(object: O, key: PropertyKey): key is keyof O => {
  return key in object;
};

/**
 * Clones an object and all its nested objects
 *
 * @param object - An object to be cloned
 *
 * @returns An identical object without references to nested objects
 */
export const deepClone = (object: ObjectType): ObjectType =>
  JSON.parse(JSON.stringify(object));

import { ObjectType } from './object.types';

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

/**
 * Gets object property by property path
 *
 * @param object - An object
 * @param path - A string or array of strings
 * @param separator - Optional separator if path is a string. '.' by default.
 *
 * @returns Value of the path or undefined
 */
export const getObjValue = (
  object: ObjectType,
  path: string | string[],
  separator?: string,
): any | undefined => {
  const pathArray = Array.isArray(path) ? path : path.split(separator || '.');
  return pathArray.reduce(
    (previous: any, current: any) => previous?.[current],
    object,
  );
};

/**
 * Converts a JavaScript value containing Set and Map, to a JSON object.
 *
 * @param value - A JavaScript value to be converted.
 *
 * @returns A JSON object
 */
export const jsonify = <T>(value: T): T => {
  return JSON.parse(
    JSON.stringify(value, (k, v) => {
      if (v instanceof Set) return [...v];
      if (v instanceof Map) return Object.fromEntries(v);
      return v;
    }),
  );
};

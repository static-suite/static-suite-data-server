import { ObjectType } from './object.types';
/**
 * Checks if an object is empty (i.e.- contains zero keys)
 *
 * @param object - An object
 *
 * @returns True if the object contains zero keys, false otherwise.
 */
export declare const isEmptyObject: (object: ObjectType) => boolean;
/**
 * Checks if an object contains a key
 *
 * @param object - An object
 * @param key - The name of a key
 *
 * @returns True if the object has the given key, false otherwise.
 */
export declare const hasKey: <T extends object>(object: T, key: PropertyKey) => key is keyof T;
/**
 * Clones an object and all its nested objects
 *
 * @param object - An object to be cloned
 *
 * @returns An identical object without references to nested objects
 */
export declare const deepClone: (object: ObjectType) => ObjectType;
/**
 * Gets object property by property path
 *
 * @param object - An object
 * @param path - A string or array of strings
 * @param separator - Optional separator if path is a string. '.' by default.
 *
 * @returns Value of the path or undefined
 */
export declare const getObjValue: (object: ObjectType, path: string | string[], separator?: string) => any | undefined;
/**
 * Converts a JavaScript value containing Set and Map, to a JSON object.
 *
 * @param value - A JavaScript value to be converted.
 *
 * @returns A JSON object
 */
export declare const jsonify: <T>(value: T) => T;
//# sourceMappingURL=objectUtils.d.ts.map
export declare type ObjectType = Record<string, unknown>;
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
export declare const hasKey: <O>(object: O, key: PropertyKey) => key is keyof O;
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
export declare const getObjValue: (object: ObjectType, path: string | string[], separator?: string | undefined) => any | undefined;
//# sourceMappingURL=objectUtils.d.ts.map
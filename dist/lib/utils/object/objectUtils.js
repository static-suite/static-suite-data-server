"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getObjValue = exports.deepClone = exports.hasKey = exports.isEmptyObject = void 0;
/**
 * Checks if an object is empty (i.e.- contains zero keys)
 *
 * @param object - An object
 *
 * @returns True if the object contains zero keys, false otherwise.
 */
const isEmptyObject = (object) => Object.keys(object).length === 0;
exports.isEmptyObject = isEmptyObject;
/**
 * Checks if an object contains a key
 *
 * @param object - An object
 * @param key - The name of a key
 *
 * @returns True if the object has the given key, false otherwise.
 */
const hasKey = (object, key) => {
    return key in object;
};
exports.hasKey = hasKey;
/**
 * Clones an object and all its nested objects
 *
 * @param object - An object to be cloned
 *
 * @returns An identical object without references to nested objects
 */
const deepClone = (object) => JSON.parse(JSON.stringify(object));
exports.deepClone = deepClone;
/**
 * Gets object property by property path
 *
 * @param object - An object
 * @param path - A string or array of strings
 * @param separator - Optional separator if path is a string. '.' by default.
 *
 * @returns Value of the path or undefined
 */
const getObjValue = (object, path, separator) => {
    const pathArray = Array.isArray(path) ? path : path.split(separator || '.');
    pathArray.reduce((previous, current) => previous?.[current], object);
};
exports.getObjValue = getObjValue;

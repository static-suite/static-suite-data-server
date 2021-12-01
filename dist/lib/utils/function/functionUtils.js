"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArgs = void 0;
/**
 * Gets arguments from a function
 *
 * @param f - A function
 *
 * @returns An array with the function arguments.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
const getArgs = (f) => {
    const argsArray = f
        .toString()
        .replace(/[\r\n\s]+/g, ' ')
        .match(/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/);
    return argsArray
        ? argsArray
            .slice(1, 3)
            .join('')
            .split(/\s*,\s*/)
        : [];
};
exports.getArgs = getArgs;

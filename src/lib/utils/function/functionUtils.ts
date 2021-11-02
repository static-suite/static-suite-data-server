/**
 * Gets arguments from a function
 *
 * @param fn - A function
 *
 * @returns An array with the names of the function arguments.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const getArgs = (fn: Function): string[] => {
  const argsArray = fn
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

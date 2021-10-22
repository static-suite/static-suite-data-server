/**
 * Gets arguments from a function
 *
 * @param f - A function
 *
 * @returns An array with the function arguments.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const getArgs = (f: Function): string[] => {
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

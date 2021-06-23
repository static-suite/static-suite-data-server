const getArgs = f =>
  f
    .toString()
    .replace(/[\r\n\s]+/g, ' ')
    .match(/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/)
    .slice(1, 3)
    .join('')
    .split(/\s*,\s*/);

module.exports = { getArgs };

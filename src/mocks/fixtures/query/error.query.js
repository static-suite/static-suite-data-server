const error = () => {
  // eslint-disable-next-line no-throw-literal
  throw new Error('oops');
};

module.exports.queryHandler = error;

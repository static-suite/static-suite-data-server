module.exports = moduleId => {
  // Jest completely takes over the require system for the
  // code under test. Therefore, it does not implement require.cache.
  // Until that problem is fixed, we must reset all modules
  // when clear-module is used.
  jest.resetModules();
};

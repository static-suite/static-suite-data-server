/* eslint-disable no-undef */
module.exports.onProcessFile = ({ fileContent }) => {
  // Do something...
  return {
    raw: fileContent.raw,
    json: fileContent.json,
  };
};

module.exports.onStoreAdd = (/* _dataDir, _file, _fileContent, _store */) => {
  // Do something...
};

module.exports.onStoreRemove = (/* _file, _store */) => {
  // Do something...
};

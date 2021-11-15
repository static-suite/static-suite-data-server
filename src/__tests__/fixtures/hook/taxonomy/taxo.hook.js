exports.onProcessFile = ({ fileContent }) => {
  // Do something...
  return {
    raw: fileContent.raw,
    json: fileContent.json,
  };
};

exports.onStoreAdd = (/* _dataDir, _file, _fileContent, _store */) => {
  // Do something...
};

exports.onStoreRemove = (/* _file, _store */) => {
  // Do something...
};

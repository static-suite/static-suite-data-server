const main = {
  processFile: (_dataDir, _file, fileContent /* , _store */) => {
    // Do something...
    return {
      raw: fileContent.raw,
      json: fileContent.json,
    };
  },

  storeAdd: (/* _dataDir, _file, _fileContent, _store */) => {
    // Do something...
  },

  storeRemove: (/* _file, _store */) => {
    // Do something...
  },
};

module.exports = main;

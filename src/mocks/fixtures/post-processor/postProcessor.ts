import { PostProcessor } from '@lib/store/postProcessor/postProcessor.types';
import { FileType } from '@lib/utils/fs/fs.types';

const main: PostProcessor = {
  processFile: (_dataDir, _file, fileContent /* , _store */) => {
    // Do something...
    return <FileType>{
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

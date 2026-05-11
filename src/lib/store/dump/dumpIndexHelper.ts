import fs from 'fs';
import { logger } from '../../utils/logger';
import { createHash } from '../../utils/string';
import { config } from '../../config';
// import { Dump, DumpMetadata } from './dump.types';
// import { unixEpochUniqueId } from '../workDir';
import { findFilesInDir, getFileContent } from '../../utils/fs';
import { IndexEntry } from './dump.types';

const index = new Map<string, IndexEntry>();

let isStale: boolean | undefined = undefined;

const getIndexFilepath = () => `${config.dumpDir}/files.idx`;
const getIndexIsStaleFlagFilepath = () =>
  `${config.dumpDir}/index-is-stale.flag`;

const indexToString = (): string => {
  const indexLines: string[] = [];
  index.forEach((value, filePath) => {
    const line = [filePath, value.hash, value.url];
    indexLines.push(line.join('\t'));
  });
  return indexLines.join('\n');
};

const setIsStale = (value: boolean): void => {
  if (isStale !== value) {
    isStale = value;
    const indexIsStaleFlagFilepath = getIndexIsStaleFlagFilepath();
    if (isStale === true) {
      fs.writeFileSync(indexIsStaleFlagFilepath, '');
    } else {
      if (fs.existsSync(indexIsStaleFlagFilepath)) {
        fs.unlinkSync(indexIsStaleFlagFilepath);
      }
    }
  }
};

export const dumpIndexHelper = {
  isDumpIndexStale: (): boolean => {
    if (isStale === undefined) {
      const indexIsStaleFlagFilepath = getIndexIsStaleFlagFilepath();
      if (fs.existsSync(indexIsStaleFlagFilepath)) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }
    }
    return !!isStale;
  },

  isDumpIndexPresent: (): boolean => fs.existsSync(getIndexFilepath()),

  saveDumpIndex: (): void => {
    if (isStale) {
      const indexFilepath = getIndexFilepath();
      const indexAsString = indexToString().trim();
      fs.writeFileSync(indexFilepath, indexAsString);
      setIsStale(false);
    }
  },

  createDumpIndex: (): void => {
    if (config.dumpDir) {
      setIsStale(true);
      logger.info('Creating dump index...');
      const startDate = Date.now();
      index.clear();
      const filesDumpDir = `${config.dumpDir}/files`;
      const relativeFilePaths = findFilesInDir(filesDumpDir);
      relativeFilePaths.forEach(relativeFilePath => {
        const fileContent = getFileContent(
          `${filesDumpDir}/${relativeFilePath}`,
        );
        if (fileContent.raw) {
          const url = fileContent.json
            ? fileContent.json.data?.content?.url?.path
            : null;
          const hash = createHash(fileContent.raw);
          index.set(relativeFilePath, { hash, url });
        }
      });

      // Save index into disk
      dumpIndexHelper.saveDumpIndex();

      logger.info(
        `${relativeFilePaths.length} files in dump indexed in ${
          Date.now() - startDate
        }ms.`,
      );
    }
  },

  loadDumpIndex: (): void => {
    if (config.dumpDir) {
      logger.info('Loading dump index...');
      const startDate = Date.now();
      const indexFilepath = getIndexFilepath();
      const data = fs.readFileSync(indexFilepath).toString().trim();
      index.clear();
      // Split lines and remove empty ones.
      const dataLines: string[] = data.split('\n').filter(line => !!line);
      dataLines.forEach(line => {
        const [relativeFilePath, hash, url] = line.split('\t');
        index.set(relativeFilePath, { hash, url });
      });
      logger.info(
        `${dataLines.length} entries loaded from dump index in ${
          Date.now() - startDate
        }ms.`,
      );
    }
  },

  hasEntry: (relativeFilePath: string): boolean => index.has(relativeFilePath),

  getEntry: (relativeFilePath: string): IndexEntry | undefined =>
    index.get(relativeFilePath),

  getKeys: () => index.keys(),

  addEntry: (relativeFilePath: string, entry: IndexEntry): void => {
    setIsStale(true);
    index.set(relativeFilePath, entry);
  },

  removeEntry: (relativeFilePath: string): void => {
    setIsStale(true);
    index.delete(relativeFilePath);
  },
};

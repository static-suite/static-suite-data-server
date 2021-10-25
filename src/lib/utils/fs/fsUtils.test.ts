import { logger } from '@lib/utils/logger';
import {
  readFile,
  getFileContent,
  findFilesInDir,
  getModificationDate,
} from './fsUtils';

beforeEach(() => {
  logger.error = jest.fn();
});

describe('File System utils test', () => {
  describe('readFile', () => {
    it('reads an existing filepath without logging any error', () => {
      expect(
        readFile('src/mocks/fixtures/example-dir/global.json'),
      ).not.toBeNull();
      expect(logger.error).not.toHaveBeenCalled();
    });
    it('logs an error when reading a non-existing filepath', () => {
      expect(readFile('invalid-path')).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getFileContent', () => {
    describe('when file exists', () => {
      it(`returns an object with non-null "raw" and "json" properties if the file is a JSON file`, () => {
        const fileContent = getFileContent(
          'src/mocks/fixtures/example-dir/global.json',
        );
        expect(fileContent.json).not.toBeNull();
        expect(fileContent.raw).not.toBeNull();
      });
      it(`returns an object with a non-null "raw" property and a null "json" property if the file is not a JSON file`, () => {
        const fileContent = getFileContent(
          'src/mocks/fixtures/example-dir/example.txt',
        );
        expect(fileContent.json).toBeNull();
        expect(fileContent.raw).not.toBeNull();
      });
    });
    describe('when file does not exist', () => {
      it(`returns an object with null "raw" and "json" properties`, () => {
        const fileContent = getFileContent('invalid-path');
        expect(fileContent.json).toBeNull();
        expect(fileContent.raw).toBeNull();
      });
    });
  });

  describe('findFilesInDir', () => {
    it('finds a file non-recursively in a directory', () => {
      const filesInDir = findFilesInDir(
        'src/mocks/fixtures/example-dir',
        '*.txt',
      );
      expect(filesInDir).toHaveLength(1);
    });
    it('finds several files recursively in a directory', () => {
      const filesInDir = findFilesInDir('src/mocks/fixtures/example-dir');
      expect(filesInDir).toHaveLength(18);
    });
  });

  describe('getModificationDate', () => {
    it('returns a Date for an existing filepath without logging any error', () => {
      expect(
        getModificationDate('src/mocks/fixtures/example-dir/global.json'),
      ).not.toBeNull();
      expect(logger.error).not.toHaveBeenCalled();
    });
    it('logs an error for a non-existing filepath', () => {
      expect(getModificationDate('invalid-path')).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

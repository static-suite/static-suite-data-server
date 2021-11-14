import fs from 'fs';
import path from 'path';
import { logger } from '@lib/utils/logger';
import {
  readFile,
  getFileContent,
  findFilesInDir,
  getModificationDate,
} from '../fsUtils';

const fixturesDir = path.join(__dirname, './fixtures/');
const jsonFixturePath = path.join(fixturesDir, 'file.json');
const jsonRawValue = fs.readFileSync(jsonFixturePath, 'utf8');
const jsonParsedValue = JSON.parse(jsonRawValue);

beforeEach(() => {
  logger.error = jest.fn();
});

describe('File System utils test', () => {
  describe('readFile', () => {
    it('reads an existing filepath without logging any error', () => {
      expect(readFile(jsonFixturePath)).toBe(jsonRawValue);
      expect(logger.error).not.toHaveBeenCalled();
    });
    it('logs an error when reading a non-existing filepath', () => {
      expect(readFile('invalid-path')).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getFileContent', () => {
    describe('when a file exists', () => {
      describe('if it is a JSON file', () => {
        it('returns an object with non-null "raw" and "json" properties ', () => {
          const fileContent = getFileContent(jsonFixturePath);
          expect(fileContent.json).toStrictEqual(jsonParsedValue);
          expect(fileContent.raw).toBe(jsonRawValue);
        });
      });
      describe('if it is not a JSON file', () => {
        it('returns an object with a non-null "raw" property and a null "json" property', () => {
          const txtFixturePath = path.join(fixturesDir, 'file.txt');
          const txtRawValue = fs.readFileSync(txtFixturePath, 'utf8');

          const fileContent = getFileContent(txtFixturePath);

          expect(fileContent.json).toBeNull();
          expect(fileContent.raw).toBe(txtRawValue);
        });
      });
    });
    describe('when a file does not exist', () => {
      it('returns an object with null "raw" and "json" properties', () => {
        const fileContent = getFileContent('invalid-path');
        expect(fileContent.json).toBeNull();
        expect(fileContent.raw).toBeNull();
      });
    });
  });

  describe('findFilesInDir', () => {
    it('finds a file non-recursively in a directory', () => {
      const filesInDir = findFilesInDir(fixturesDir, '*.txt');
      expect(filesInDir).toStrictEqual(['file.txt']);
    });
    it('finds several files recursively in a directory', () => {
      const filesInDir = findFilesInDir(fixturesDir);
      expect(filesInDir).toStrictEqual(['file.json', 'file.txt']);
    });
  });

  describe('getModificationDate', () => {
    it('returns a Date for an existing filepath without logging any error', () => {
      expect(getModificationDate(jsonFixturePath) instanceof Date).toBe(true);
      expect(logger.error).not.toHaveBeenCalled();
    });
    it('returns null and logs an error for a non-existing filepath', () => {
      expect(getModificationDate('invalid-path')).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

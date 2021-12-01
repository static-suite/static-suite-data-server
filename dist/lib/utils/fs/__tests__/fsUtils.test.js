"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("@lib/utils/logger");
const fsUtils_1 = require("../fsUtils");
const fixturesDir = path_1.default.join(__dirname, './fixtures/');
const jsonFixturePath = path_1.default.join(fixturesDir, 'file.json');
const jsonRawValue = fs_1.default.readFileSync(jsonFixturePath, 'utf8');
const jsonParsedValue = JSON.parse(jsonRawValue);
beforeEach(() => {
    logger_1.logger.error = jest.fn();
});
describe('File System utils test', () => {
    describe('readFile', () => {
        it('reads an existing filepath without logging any error', () => {
            expect((0, fsUtils_1.readFile)(jsonFixturePath)).toBe(jsonRawValue);
            expect(logger_1.logger.error).not.toHaveBeenCalled();
        });
        it('logs an error when reading a non-existing filepath', () => {
            expect((0, fsUtils_1.readFile)('invalid-path')).toBeNull();
            expect(logger_1.logger.error).toHaveBeenCalled();
        });
    });
    describe('getFileContent', () => {
        describe('when a file exists', () => {
            describe('if it is a JSON file', () => {
                it('returns an object with non-null "raw" and "json" properties ', () => {
                    const fileContent = (0, fsUtils_1.getFileContent)(jsonFixturePath);
                    expect(fileContent.json).toStrictEqual(jsonParsedValue);
                    expect(fileContent.raw).toBe(jsonRawValue);
                });
            });
            describe('if it is not a JSON file', () => {
                it('returns an object with a non-null "raw" property and a null "json" property', () => {
                    const txtFixturePath = path_1.default.join(fixturesDir, 'file.txt');
                    const txtRawValue = fs_1.default.readFileSync(txtFixturePath, 'utf8');
                    const fileContent = (0, fsUtils_1.getFileContent)(txtFixturePath);
                    expect(fileContent.json).toBeNull();
                    expect(fileContent.raw).toBe(txtRawValue);
                });
            });
        });
        describe('when a file does not exist', () => {
            it('returns an object with null "raw" and "json" properties', () => {
                const fileContent = (0, fsUtils_1.getFileContent)('invalid-path');
                expect(fileContent.json).toBeNull();
                expect(fileContent.raw).toBeNull();
            });
        });
    });
    describe('findFilesInDir', () => {
        it('finds a file non-recursively in a directory', () => {
            const filesInDir = (0, fsUtils_1.findFilesInDir)(fixturesDir, '*.txt');
            expect(filesInDir).toStrictEqual(['file.txt']);
        });
        it('finds several files recursively in a directory', () => {
            const filesInDir = (0, fsUtils_1.findFilesInDir)(fixturesDir);
            expect(filesInDir).toStrictEqual(['file.json', 'file.txt']);
        });
    });
    describe('getModificationDate', () => {
        it('returns a Date for an existing filepath without logging any error', () => {
            expect((0, fsUtils_1.getModificationDate)(jsonFixturePath) instanceof Date).toBe(true);
            expect(logger_1.logger.error).not.toHaveBeenCalled();
        });
        it('returns null and logs an error for a non-existing filepath', () => {
            expect((0, fsUtils_1.getModificationDate)('invalid-path')).toBeNull();
            expect(logger_1.logger.error).toHaveBeenCalled();
        });
    });
});

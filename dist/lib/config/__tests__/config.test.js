"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dataServer_types_1 = require("@lib/dataServer.types");
const path_1 = require("path");
const config_1 = require("../config");
const error_1 = require("../error");
describe('Config test', () => {
    describe('setConfig', () => {
        it('Returns correct config', () => {
            const testConfig = {
                dataDir: 'src/__tests__/fixtures/data/',
                workDir: 'src/__tests__/fixtures/work/',
                queryDir: 'src/__tests__/fixtures/query',
                hookDir: 'src/__tests__/fixtures/hook',
            };
            const expectedConfig = {
                dataDir: (0, path_1.resolve)(testConfig.dataDir),
                workDir: (0, path_1.resolve)(testConfig.workDir),
                queryDir: (0, path_1.resolve)(testConfig.queryDir),
                hookDir: (0, path_1.resolve)(testConfig.hookDir),
                runMode: 'prod',
            };
            expect((0, config_1.setConfig)(testConfig)).toEqual(expectedConfig);
        });
        it('Required option dataDir returns expected error', () => {
            const config = {
                runMode: dataServer_types_1.RunMode.DEV,
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => (0, config_1.setConfig)(config)).toThrowError(error_1.MissingRequiredOption);
        });
        it('wrong option runMode returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                runMode: 'xx',
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => (0, config_1.setConfig)(config)).toThrowError(error_1.InvalidRunMode);
        });
        it('Wrong dataDir returns expected error', () => {
            const config = {
                dataDir: 'non-existent-dir',
                runMode: dataServer_types_1.RunMode.DEV,
            };
            expect.assertions(2);
            try {
                (0, config_1.setConfig)(config);
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_1.MissingDirectory);
                expect(error).toHaveProperty('directoryId', 'dataDir');
            }
        });
        it('Wrong workDir returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                workDir: 'non-existent-dir',
                runMode: dataServer_types_1.RunMode.DEV,
            };
            expect.assertions(2);
            try {
                (0, config_1.setConfig)(config);
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_1.MissingDirectory);
                expect(error).toHaveProperty('directoryId', 'workDir');
            }
        });
        it('Wrong queryDir returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                queryDir: 'non-existent-dir',
                runMode: dataServer_types_1.RunMode.DEV,
            };
            expect.assertions(2);
            try {
                (0, config_1.setConfig)(config);
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_1.MissingDirectory);
                expect(error).toHaveProperty('directoryId', 'queryDir');
            }
        });
        it('Wrong hookDir returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                hookDir: 'non-existent-dir',
                runMode: dataServer_types_1.RunMode.DEV,
            };
            expect.assertions(2);
            try {
                (0, config_1.setConfig)(config);
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_1.MissingDirectory);
                expect(error).toHaveProperty('directoryId', 'hookDir');
            }
        });
    });
});

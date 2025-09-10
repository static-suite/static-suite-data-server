"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataServer_types_1 = require("../../dataServer.types");
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
                taskDir: 'src/__tests__/fixtures/task',
            };
            const expectedConfig = {
                dataDir: fs_1.default.realpathSync(path_1.default.resolve(testConfig.dataDir)),
                workDir: fs_1.default.realpathSync(path_1.default.resolve(testConfig.workDir)),
                queryDir: fs_1.default.realpathSync(path_1.default.resolve(testConfig.queryDir)),
                hookDir: fs_1.default.realpathSync(path_1.default.resolve(testConfig.hookDir)),
                taskDir: fs_1.default.realpathSync(path_1.default.resolve(testConfig.taskDir)),
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
            expect(() => (0, config_1.setConfig)(config)).toThrow(error_1.MissingRequiredOption);
        });
        it('wrong option runMode returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                runMode: 'xx',
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            expect(() => (0, config_1.setConfig)(config)).toThrow(error_1.InvalidRunMode);
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
        it('Wrong taskDir returns expected error', () => {
            const config = {
                dataDir: 'src/__tests__/fixtures/data/',
                taskDir: 'non-existent-dir',
                runMode: dataServer_types_1.RunMode.DEV,
            };
            expect.assertions(2);
            try {
                (0, config_1.setConfig)(config);
            }
            catch (error) {
                expect(error).toBeInstanceOf(error_1.MissingDirectory);
                expect(error).toHaveProperty('directoryId', 'taskDir');
            }
        });
    });
});

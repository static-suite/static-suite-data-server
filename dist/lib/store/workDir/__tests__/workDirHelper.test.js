"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const config_1 = require("../../../config");
const workDirHelper_1 = require("../workDirHelper");
describe('workDirHelper test', () => {
    describe('getChangedFilesSince', () => {
        config_1.config.workDir = fs_1.default.realpathSync(path_1.default.resolve('src/__tests__/fixtures/work'));
        it(`Gets modified and deleted files from static-suite log`, () => {
            expect(workDirHelper_1.workDirHelper.getChangedFilesBetween('2021-08-16_07-11-55.666963__3503', '2021-08-17_08-50-00.235800__1900')).toEqual({
                fromUniqueId: '2021-08-16_07-11-55.666963__3503',
                toUniqueId: '2021-08-17_08-50-00.235800__1900',
                deleted: ['es/entity/node/article/10.json'],
                updated: [
                    'en/entity/node/article/10.json',
                    'es/config/static_export.settings.json',
                    'es/entity/node/recipe/9.json',
                ],
                all: [
                    { file: 'es/entity/node/article/10.json', type: 'deleted' },
                    { file: 'en/entity/node/article/10.json', type: 'updated' },
                    {
                        file: 'es/config/static_export.settings.json',
                        type: 'updated',
                    },
                    {
                        file: 'es/entity/node/recipe/9.json',
                        type: 'updated',
                    },
                ],
            });
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@lib/config");
const path_1 = require("path");
const workDirHelper_1 = require("../workDirHelper");
describe('workDirHelper test', () => {
    describe('getChangedFilesSince', () => {
        config_1.config.workDir = (0, path_1.resolve)('src/__tests__/fixtures/work');
        it(`Gets modified and deleted files from static-suite log`, () => {
            expect(workDirHelper_1.workDirHelper.getChangedFilesSince(new Date('2021-08-01'))).toEqual({
                deleted: ['es/entity/node/article/10.json'],
                updated: [
                    'en/entity/node/article/10.json',
                    'es/config/static_export.settings.json',
                    'es/entity/node/recipe/9.json',
                ],
            });
        });
    });
});

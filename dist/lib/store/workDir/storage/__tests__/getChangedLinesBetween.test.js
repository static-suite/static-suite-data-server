"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../../../config");
const getChangedLinesBetween_1 = require("../getChangedLinesBetween");
describe('workDir storage getChangedLinesBetween test', () => {
    describe('getChangedLinesBetween', () => {
        config_1.config.workDir = fs_1.default.realpathSync(path_1.default.resolve('src/__tests__/fixtures/work'));
        it(`Gets lines of log since given date`, () => {
            expect((0, getChangedLinesBetween_1.getChangedLinesBetween)('2021-08-16_07-11-55.666963__3503', '2021-08-17_08-50-00.235800__1900')).toEqual([
                '2021-08-16_07-11-55.666963__3504 delete [ID: 10] Prueba y cultiva tus propias hierbas | static-local://es/entity/node/article/10.json',
                '2021-08-16_07-12-45.771095__5959 write [ID: 10] Give it a go and grow your own herbs | static-local://en/entity/node/article/10.json',
                '2021-08-16_07-12-46.771095__5959 delete [ID: 10] Give it a go and grow your own herbs | static-local://en/entity/node/article/10.json',
                '2021-08-16_07-12-47.771095__5959 write [ID: 10] Give it a go and grow your own herbs | static-local://en/entity/node/article/10.json',
                '2021-08-17_08-49-26.273927__5991 write [ID: static_export.settings] static_export.settings | static-local://es/config/static_export.settings.json',
                '2021-08-17_08-50-00.235800__1900 write [ID: 9] Salsa de chile ardiente | static-local://es/entity/node/recipe/9.json',
            ]);
        });
    });
});

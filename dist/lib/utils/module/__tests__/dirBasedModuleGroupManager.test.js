"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleQueryManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../../config");
const __1 = require("..");
config_1.config.queryDir = fs_1.default.realpathSync(path_1.default.resolve(path_1.default.join(__dirname, '../../../../../src/lib/utils/module/__mocks__')));
exports.exampleQueryManager = (0, __1.dirBasedModuleGroupManager)('query');
describe('dirBasedModuleGroupManager test', () => {
    describe('getModuleGroupInfo', () => {
        it('loads a directory of modules', () => {
            const moduleGroupInfo = exports.exampleQueryManager.getModuleGroupInfo();
            expect(moduleGroupInfo.size).toBe(2);
            expect(Array.from(moduleGroupInfo.keys())).toStrictEqual([
                'dummyModule',
                'dummyModule2',
            ]);
            expect(moduleGroupInfo.get('dummyModule')).not.toBe(null);
            expect(moduleGroupInfo.get('dummyModule2')).not.toBe(null);
        });
    });
    describe('reset', () => {
        it('resets a directory of modules', () => {
            const moduleGroupInfo = exports.exampleQueryManager.getModuleGroupInfo();
            expect(moduleGroupInfo.size).toBe(2);
            exports.exampleQueryManager.reset();
            expect(moduleGroupInfo.size).toBe(0);
        });
    });
});

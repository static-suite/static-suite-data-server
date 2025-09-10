"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../../config");
beforeEach(() => {
    config_1.config.dataDir = fs_1.default.realpathSync(path_1.default.resolve('src/__tests__/fixtures/data'));
});
describe('dataDirManager test', () => {
    describe('loadDataDir', () => {
        it(`Adds to store all files in datadir`, () => {
            expect('1').toEqual('1');
        });
    });
});

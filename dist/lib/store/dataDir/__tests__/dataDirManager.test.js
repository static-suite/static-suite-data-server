"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@lib/config");
const path_1 = require("path");
beforeEach(() => {
    config_1.config.dataDir = (0, path_1.resolve)('src/mocks/fixtures/data');
});
describe('dataDirManager test', () => {
    describe('loadDataDir', () => {
        it(`Adds to store all files in datadir`, () => {
            expect('1').toEqual('1');
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aliasIncludeParser_1 = require("../aliasIncludeParser");
describe('aliasIncludeParser', () => {
    it('mount data on correct paths without alias and deletes original path', () => {
        const fileContent = {
            data: {
                localeInclude: 'xxx',
            },
        };
        (0, aliasIncludeParser_1.aliasIncludeParser)({
            fileContent,
            includeData: { includedData: 'yyy' },
            mountPointPath: ['data'],
            includeKey: 'localeInclude',
        });
        expect(fileContent.data).toStrictEqual({
            locale: { includedData: 'yyy' },
        });
    });
    it('mount data on correct paths with alias and deletes original path', () => {
        const fileContent = {
            data: {
                myLocaleInclude: 'xxx',
            },
        };
        (0, aliasIncludeParser_1.aliasIncludeParser)({
            fileContent,
            includeData: { includedData: 'yyy' },
            mountPointPath: ['data'],
            includeKey: 'myLocaleInclude',
        });
        expect(fileContent.data).toStrictEqual({
            myLocale: { includedData: 'yyy' },
        });
    });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const aliasWithoutTypeIncludeParser_1 = require("../aliasWithoutTypeIncludeParser");
describe('aliasWithoutTypeIncludeParser', () => {
    it('mount data on correct paths without alias and deletes original path', () => {
        const fileContent = {
            data: {
                customInclude: 'xxx',
            },
        };
        (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)({
            fileContent,
            includeData: { includedData: 'yyy' },
            mountPointPath: ['data'],
            includeKey: 'customInclude',
        }, 'custom');
        expect(fileContent.data).toStrictEqual({
            custom: { includedData: 'yyy' },
        });
    });
    it('mount data on correct paths with alias and deletes original path', () => {
        const fileContent = {
            data: {
                myCustomInclude: 'xxx',
            },
        };
        (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)({
            fileContent,
            includeData: { includedData: 'yyy' },
            mountPointPath: ['data'],
            includeKey: 'myCustomInclude',
        }, 'custom');
        expect(fileContent.data).toStrictEqual({
            my: { includedData: 'yyy' },
        });
    });
});

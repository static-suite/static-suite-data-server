"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityIncludeParser_1 = require("../entityIncludeParser");
describe('entityIncludeParser', () => {
    it('mounts data on correct path', () => {
        const host = {
            data: {
                content: {
                    entity: {
                        entityInclude: 'xxx',
                    },
                },
            },
        };
        (0, entityIncludeParser_1.entityIncludeParser)({
            host,
            target: { data: { content: { includedData: 'yyy' } } },
            mountPath: ['data', 'content', 'entity'],
            includeKey: 'entityInclude',
        });
        expect(host.data.content.entity).toStrictEqual({
            includedData: 'yyy',
        });
    });
    it('returns undefined when includeData has not data.content structure', () => {
        const host = {
            data: {
                content: {
                    entity: {
                        entityInclude: 'xxx',
                    },
                },
            },
        };
        (0, entityIncludeParser_1.entityIncludeParser)({
            host,
            target: { includedData: 'yyy' },
            mountPath: ['data', 'content', 'entity'],
            includeKey: 'entityInclude',
        });
        expect(host.data.content.entity).toBeUndefined();
    });
});

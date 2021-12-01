"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const path_1 = require("path");
const includeParser_1 = require("../includeParser");
const staticFileContent = {
    data: {
        content: {
            id: '58724',
            title: 'Título 1',
            author: {
                entity: {
                    entityInclude: 'article2.json',
                },
            },
            image: {
                entity: {
                    entityInclude: 'article2.json',
                },
            },
            queryInclude: 'lastPublishedContents',
        },
    },
    metadata: {
        includes: [
            'data.content.author.entity.entityInclude',
            'data.content.image.entity.entityInclude',
            'data.content.queryInclude',
        ],
    },
};
store_1.store.data.set('article2.json', {
    data: {
        content: {
            id: '58728',
            title: 'Título 2',
        },
    },
});
describe('staticIncludeParser', () => {
    it('sets correct value by reference', () => {
        includeParser_1.includeParser.static.run(staticFileContent);
        expect(staticFileContent.data.content.author.entity).toBe(store_1.store.data.get('article2.json').data.content);
        store_1.store.data.get('article2.json').data.content.title = 'Title 3';
        expect(staticFileContent.data.content.author.entity).toBe(store_1.store.data.get('article2.json').data.content);
    });
});
const dynamicFileContent = {
    data: {
        content: {
            queryInclude: 'query2?y=10',
        },
    },
    metadata: {
        includes: ['data.content.queryInclude'],
    },
};
config_1.config.queryDir = (0, path_1.resolve)('src/__tests__/fixtures/query');
describe('queryIncludeParser', () => {
    it('sets correct value', () => {
        includeParser_1.includeParser.dynamic.run(dynamicFileContent);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(dynamicFileContent.data.content.query.data).toStrictEqual([
            { id: '1' },
        ]);
    });
});

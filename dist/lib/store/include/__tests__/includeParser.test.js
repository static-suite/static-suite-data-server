"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../../config");
const store_1 = require("../../store");
const includeParser_1 = require("../includeParser");
const staticFileContent = {
    data: {
        content: {
            id: '58724',
            title: 'Title',
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
        includes: {
            static: {
                'data.content.author.entity.entityInclude': 'article2.json',
                'data.content.image.entity.entityInclude': 'article2.json',
            },
            dynamic: { 'data.content.queryInclude': 'lastPublishedContents' },
        },
    },
};
store_1.store.data.set('article2.json', {
    data: {
        content: {
            id: '58728',
            title: 'Title 2',
        },
    },
});
describe('staticIncludeParser', () => {
    it('sets correct value by reference', () => {
        includeParser_1.includeParser.static('irrelevantFilePath', staticFileContent);
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
        includes: {
            dynamic: { 'data.content.queryInclude': 'query2?y=10' },
        },
    },
};
config_1.config.queryDir = fs_1.default.realpathSync(path_1.default.resolve('src/__tests__/fixtures/query'));
describe('queryIncludeParser', () => {
    it('sets correct value', () => {
        includeParser_1.includeParser.dynamic(dynamicFileContent);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        expect(dynamicFileContent.data.content.query.data).toStrictEqual([
            { id: '1' },
        ]);
    });
});

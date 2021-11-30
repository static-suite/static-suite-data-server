import { config } from '@lib/config';
import { store } from '@lib/store';
import { INDEX } from '@lib/store/store.constants';
import { resolve } from 'path';
import { includeParser } from '../includeParser';

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
store.data['article2.json'] = {
  data: {
    content: {
      id: '58728',
      title: 'Título 2',
    },
  },
};
store.data[INDEX].set('article2.json', store.data['article2.json']);

describe('staticIncludeParser', () => {
  it('sets correct value by reference', () => {
    includeParser.static.run(staticFileContent);
    expect(staticFileContent.data.content.author.entity).toBe(
      store.data['article2.json'].data.content,
    );
    store.data['article2.json'].data.content.title = 'Título 3';
    expect(staticFileContent.data.content.author.entity).toBe(
      store.data['article2.json'].data.content,
    );
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
config.queryDir = resolve('src/__tests__/fixtures/query');

describe('queryIncludeParser', () => {
  it('sets correct value', () => {
    includeParser.dinamic.run(dynamicFileContent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(dynamicFileContent.data.content.query.data).toStrictEqual([
      { id: '1' },
    ]);
  });
});

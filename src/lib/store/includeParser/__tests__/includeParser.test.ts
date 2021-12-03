import { config } from '@lib/config';
import { store } from '@lib/store';
import { resolve } from 'path';
import { includeParser } from '../includeParser';

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
      static: [
        'data.content.author.entity.entityInclude',
        'data.content.image.entity.entityInclude',
      ],
      dynamic: ['data.content.queryInclude'],
    },
  },
};
store.data.set('article2.json', {
  data: {
    content: {
      id: '58728',
      title: 'Title 2',
    },
  },
});

describe('staticIncludeParser', () => {
  it('sets correct value by reference', () => {
    includeParser.static(staticFileContent);
    expect(staticFileContent.data.content.author.entity).toBe(
      store.data.get('article2.json').data.content,
    );
    store.data.get('article2.json').data.content.title = 'Title 3';
    expect(staticFileContent.data.content.author.entity).toBe(
      store.data.get('article2.json').data.content,
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
    includes: {
      dynamic: ['data.content.queryInclude'],
    },
  },
};
config.queryDir = resolve('src/__tests__/fixtures/query');

describe('queryIncludeParser', () => {
  it('sets correct value', () => {
    includeParser.dynamic(dynamicFileContent);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(dynamicFileContent.data.content.query.data).toStrictEqual([
      { id: '1' },
    ]);
  });
});

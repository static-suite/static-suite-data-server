import { store } from '@lib/store';
import { includeIndex } from '../includeIndex';

const article1 = {
  data: { content: { title: 'irrelevant' } },
  metadata: {
    includes: {
      static: {
        'data.content.irrelevantPathA.entityInclude': 'article2.json',
        'data.content.irrelevantPathB.entityInclude': 'article4.json',
      },
    },
  },
};

const article2 = {
  data: { content: { title: 'irrelevant' } },
  metadata: {
    includes: {
      static: {
        'data.content.irrelevantPathA.entityInclude': 'article3.json',
        'data.content.irrelevantPathB.entityInclude': 'article4.json',
      },
    },
  },
};

describe('staticIncludeIndex', () => {
  it('sets include information', () => {
    includeIndex.set('article1.json', article1);
    includeIndex.set('article2.json', article2);
    expect(store.index.include.static.get('article1.json')).toBe(undefined);
    expect(
      Array.from(
        store.index.include.static.get('article2.json')?.values() || [],
      ),
    ).toEqual(['article1.json']);
    expect(
      Array.from(
        store.index.include.static.get('article3.json')?.values() || [],
      ),
    ).toEqual(['article2.json']);
    expect(
      Array.from(
        store.index.include.static.get('article4.json')?.values() || [],
      ),
    ).toEqual(['article1.json', 'article2.json']);
  });

  it('removes include information', () => {
    includeIndex.set('article1.json', article1);
    includeIndex.remove('article2.json', article2);
    expect(Array.from(store.index.include.static.keys() || [])).toEqual([
      'article2.json',
      'article4.json',
    ]);
    expect(
      Array.from(
        store.index.include.static.get('article2.json')?.values() || [],
      ),
    ).toEqual(['article1.json']);
    expect(
      Array.from(
        store.index.include.static.get('article4.json')?.values() || [],
      ),
    ).toEqual(['article1.json']);
  });

  it('gets include parents', () => {
    includeIndex.set('article1.json', article1);
    includeIndex.set('article2.json', article2);
    expect(includeIndex.getParents('article3.json')).toEqual([
      'article2.json',
      'article1.json',
    ]);
    expect(includeIndex.getParents('article2.json')).toEqual(['article1.json']);
    expect(includeIndex.getParents('article4.json')).toEqual([
      'article1.json',
      'article2.json',
    ]);
  });
});

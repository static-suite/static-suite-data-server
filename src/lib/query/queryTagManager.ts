import { store } from '@lib/store/store';
import { Json } from '@lib/utils/object/object.types';
import { QueryTagManager } from './query.types';

const invalidatedTags = new Set<string>();

const tagsByQueryIndex = new Map<string, Set<string>>();

export const queryTagManager: QueryTagManager = {
  invalidateTags: tags => {
    tags.forEach(tag => {
      invalidatedTags.add(tag);
    });
  },

  resetInvalidatedTags: () => {
    invalidatedTags.clear();
  },

  setTagsToQuery: (queryDefinition, tags) => {
    if (tags) {
      tagsByQueryIndex.set(queryDefinition, tags);
    } else {
      tagsByQueryIndex.delete(queryDefinition);
    }
  },

  getInvalidFilepaths: () => {
    const invalidFilepaths = new Set<string>();
    store.data.forEach((json: Json, relativeFilepath: string) => {
      if (json.metadata?.includes?.dynamic) {
        Object.values(json.metadata.includes.dynamic).forEach(
          queryDefinition => {
            const tagsByQuery = tagsByQueryIndex.get(queryDefinition);
            if (tagsByQuery) {
              // eslint-disable-next-line no-restricted-syntax
              for (const invalidatedTag of invalidatedTags) {
                if (tagsByQuery.has(invalidatedTag)) {
                  invalidFilepaths.add(relativeFilepath);
                  break;
                }
              }
            } else {
              invalidFilepaths.add(relativeFilepath);
            }
          },
        );
      }
    });

    return Array.from(invalidFilepaths);
  },
};

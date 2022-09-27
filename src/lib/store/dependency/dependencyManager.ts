import { store } from '../store';
import { DependencyManager } from './dependency.types';
import { getReversedDependencyTree, invalidatedTags } from './dependencyTagger';

const invalidatedFilepaths = {
  updated: new Set<string>(),
  deleted: new Set<string>(),
};

/**
 * Gets a list of parents of a dependency tag
 */
const getTagParents = (tag: string, parents = new Set<string>()) => {
  getReversedDependencyTree()
    .get(tag)
    ?.forEach(parent => {
      parents.add(parent);
      getTagParents(parent, parents);
    });
  return parents;
};

/**
 * Gets a recursive list of invalidated tags.
 *
 * @remarks
 * Iterates over all explicitly invalidated tags, and obtains all
 * its parents.
 */
const getInvalidatedTags = (): string[] => {
  const allInvalidatedTags = new Set<string>();
  const invalidatedTagsArray = Array.from(invalidatedTags);
  if (invalidatedTagsArray.length > 0) {
    invalidatedTagsArray.push('*');
  }
  invalidatedTagsArray.forEach(invalidatedTag => {
    // Mark this tag as invalidated.
    if (invalidatedTag !== '*') {
      allInvalidatedTags.add(invalidatedTag);
    }

    // Search for parents of this invalidated tag.
    getTagParents(invalidatedTag).forEach(parentTag => {
      allInvalidatedTags.add(parentTag);
    });
  });
  return Array.from(allInvalidatedTags);
};

/**
 * Manager that keeps control of dependencies between data.
 */
export const dependencyManager: DependencyManager = {
  trackInvalidatedFilepaths: () => {
    const allInvalidatedTags = getInvalidatedTags();
    allInvalidatedTags.forEach(invalidatedTag => {
      if (store.deleted.has(invalidatedTag)) {
        invalidatedFilepaths.deleted.add(invalidatedTag);
        invalidatedFilepaths.updated.delete(invalidatedTag);
      } else if (store.data.has(invalidatedTag)) {
        invalidatedFilepaths.updated.add(invalidatedTag);
        invalidatedFilepaths.deleted.delete(invalidatedTag);
      }
    });
  },

  getInvalidatedFilepaths: () => {
    dependencyManager.trackInvalidatedFilepaths();
    return {
      updated: Array.from(invalidatedFilepaths.updated),
      deleted: Array.from(invalidatedFilepaths.deleted),
    };
  },

  reset: () => {
    invalidatedTags.clear();
    invalidatedFilepaths.updated.clear();
    invalidatedFilepaths.deleted.clear();
  },
};

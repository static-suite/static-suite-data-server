"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyManager = void 0;
const dependencyTree = new Map();
const invalidatedTags = new Set();
const invalidatedFilepaths = new Set();
/**
 * Gets a list of parents of a dependency tag
 */
const getTagParents = (tag, parents = new Set()) => {
    dependencyTree.forEach((children, parent) => {
        if (children.has(tag)) {
            parents.add(parent);
            getTagParents(parent, parents);
        }
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
const getInvalidatedTags = () => {
    const tags = new Set();
    invalidatedTags.forEach(invalidatedTag => {
        // Mark this tag as invalidated.
        tags.add(invalidatedTag);
        // Search for parents of this invalidated tag.
        getTagParents(invalidatedTag).forEach(parentTag => {
            tags.add(parentTag);
        });
    });
    return Array.from(tags);
};
/**
 * Manager that keeps control of dependencies between data.
 */
exports.dependencyManager = {
    setDependency: (tag, dependsOnTags) => {
        const previousData = dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags.forEach(dependsOnTag => previousData.add(dependsOnTag));
        }
        else {
            dependencyTree.set(tag, new Set(dependsOnTags));
        }
    },
    deleteDependency: (tag, dependsOnTags) => {
        const previousData = dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags.forEach(dependsOnTag => previousData.delete(dependsOnTag));
            if (previousData.size === 0) {
                dependencyTree.delete(tag);
            }
        }
    },
    invalidateTags: tags => {
        tags.forEach(tag => {
            invalidatedTags.add(tag);
        });
    },
    trackInvalidatedFilepaths: () => {
        // const invalidFilepaths = new Set<string>();
        return getInvalidatedTags();
        /*     store.data.forEach((json: Json, relativeFilepath: string) => {
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
        }); */
        // return Array.from(invalidFilepaths);
    },
    getInvalidatedFilepaths: () => Array.from(invalidatedFilepaths),
};

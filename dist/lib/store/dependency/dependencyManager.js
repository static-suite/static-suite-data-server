"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyManager = void 0;
const store_1 = require("../store");
const dependencyTagger_1 = require("./dependencyTagger");
const invalidatedFilepaths = {
    updated: new Set(),
    deleted: new Set(),
};
/**
 * Gets a list of parents of a dependency tag
 */
const getTagParents = (tag, parents = new Set()) => {
    (0, dependencyTagger_1.getReversedDependencyTree)()
        .get(tag)
        ?.forEach(parent => {
        if (!parents.has(parent)) {
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
    const allInvalidatedTags = new Set();
    const invalidatedTagsArray = Array.from(dependencyTagger_1.invalidatedTags);
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
exports.dependencyManager = {
    trackInvalidatedFilepaths: () => {
        const allInvalidatedTags = getInvalidatedTags();
        allInvalidatedTags.forEach(invalidatedTag => {
            if (store_1.store.deleted.has(invalidatedTag)) {
                invalidatedFilepaths.deleted.add(invalidatedTag);
                invalidatedFilepaths.updated.delete(invalidatedTag);
            }
            else if (store_1.store.data.has(invalidatedTag)) {
                invalidatedFilepaths.updated.add(invalidatedTag);
                invalidatedFilepaths.deleted.delete(invalidatedTag);
            }
        });
    },
    getInvalidatedFilepaths: () => {
        exports.dependencyManager.trackInvalidatedFilepaths();
        return {
            updated: Array.from(invalidatedFilepaths.updated),
            deleted: Array.from(invalidatedFilepaths.deleted),
        };
    },
    reset: () => {
        dependencyTagger_1.invalidatedTags.clear();
        invalidatedFilepaths.updated.clear();
        invalidatedFilepaths.deleted.clear();
    },
};

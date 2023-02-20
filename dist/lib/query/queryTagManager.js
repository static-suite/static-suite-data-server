"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTagManager = void 0;
const store_1 = require("../store/store");
const invalidatedTags = new Set();
const tagsByQueryIndex = new Map();
exports.queryTagManager = {
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
        }
        else {
            tagsByQueryIndex.delete(queryDefinition);
        }
    },
    getInvalidFilepaths: () => {
        const invalidFilepaths = new Set();
        store_1.store.data.forEach((json, relativeFilepath) => {
            if (json?.metadata?.includes?.dynamic) {
                Object.values(json.metadata.includes.dynamic).forEach(queryDefinition => {
                    const tagsByQuery = tagsByQueryIndex.get(queryDefinition);
                    if (tagsByQuery) {
                        // eslint-disable-next-line no-restricted-syntax
                        for (const invalidatedTag of invalidatedTags) {
                            if (tagsByQuery.has(invalidatedTag)) {
                                invalidFilepaths.add(relativeFilepath);
                                break;
                            }
                        }
                    }
                    else {
                        invalidFilepaths.add(relativeFilepath);
                    }
                });
            }
        });
        return Array.from(invalidFilepaths);
    },
};

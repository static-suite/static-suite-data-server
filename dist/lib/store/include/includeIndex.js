"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeIndex = void 0;
const store_1 = require("@lib/store");
/**
 * Helper method to get a recursive list of files containing a given file.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be searched for.
 * @param parentStack - Stack of already found parents.
 *
 * @returns A list of files as a Set of strings
 */
const getRecursiveParents = (relativeFilepath, parentStack) => {
    const parents = store_1.store.index.include.static.get(relativeFilepath);
    if (parents) {
        parents.forEach((parentRelativeFilepath) => {
            parentStack.add(parentRelativeFilepath);
            getRecursiveParents(parentRelativeFilepath, parentStack);
        });
    }
    return parentStack;
};
/**
 * Service that updates the include index that holds relationships between data.
 */
exports.includeIndex = {
    set: (relativeFilepath, fileContents) => {
        const staticIncludes = fileContents?.metadata?.includes?.static;
        if (staticIncludes) {
            Object.values(staticIncludes).forEach((includeRelativeFilepath) => {
                const includeMap = store_1.store.index.include.static.get(includeRelativeFilepath) ||
                    store_1.store.index.include.static
                        .set(includeRelativeFilepath, new Set())
                        .get(includeRelativeFilepath);
                includeMap?.add(relativeFilepath);
            });
        }
        const dynamicIncludes = fileContents?.metadata?.includes?.dynamic;
        if (dynamicIncludes) {
            // todo
        }
    },
    remove: (relativeFilepath, fileContents) => {
        const staticIncludes = fileContents?.metadata?.includes?.static;
        if (staticIncludes) {
            Object.values(staticIncludes).forEach((includeRelativeFilepath) => {
                const includeMap = store_1.store.index.include.static.get(includeRelativeFilepath) ||
                    store_1.store.index.include.static
                        .set(includeRelativeFilepath, new Set())
                        .get(includeRelativeFilepath);
                if (includeMap) {
                    includeMap.delete(relativeFilepath);
                    if (includeMap.size === 0) {
                        store_1.store.index.include.static.delete(includeRelativeFilepath);
                    }
                }
            });
        }
        const dynamicIncludes = fileContents?.metadata?.includes?.dynamic;
        if (dynamicIncludes) {
            // todo
        }
    },
    getParents: (relativeFilepath) => Array.from(getRecursiveParents(relativeFilepath, new Set())),
};

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyTagger = exports.getReversedDependencyTree = exports.invalidatedTags = exports.dependencyTree = void 0;
exports.dependencyTree = new Map();
exports.invalidatedTags = new Set();
const reversedDependencyTree = new Map();
let reversedDependencyTreeIsValid = false;
/**
 * Makes a reverted version of the dependency tree
 *
 * @remarks Required to be able to search for dependencies in a fast way.
 */
const getReversedDependencyTree = () => {
    if (!reversedDependencyTreeIsValid) {
        reversedDependencyTree.clear();
        exports.dependencyTree.forEach((children, parent) => {
            children.forEach(child => {
                const previousData = reversedDependencyTree.get(child);
                if (previousData) {
                    previousData.add(parent);
                }
                else {
                    reversedDependencyTree.set(child, new Set([parent]));
                }
            });
        });
        reversedDependencyTreeIsValid = true;
    }
    return reversedDependencyTree;
};
exports.getReversedDependencyTree = getReversedDependencyTree;
exports.dependencyTagger = {
    setDependency: (tag, dependsOnTags) => {
        exports.dependencyTree.set(tag, new Set(dependsOnTags));
        reversedDependencyTreeIsValid = false;
    },
    addDependency: (tag, dependsOnTags) => {
        const previousData = exports.dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags.forEach(dependsOnTag => previousData.add(dependsOnTag));
        }
        else {
            exports.dependencyTree.set(tag, new Set(dependsOnTags));
        }
        reversedDependencyTreeIsValid = false;
    },
    deleteDependency: (tag, dependsOnTags) => {
        const previousData = exports.dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags?.forEach(dependsOnTag => previousData.delete(dependsOnTag));
            if (previousData.size === 0) {
                exports.dependencyTree.delete(tag);
            }
        }
        reversedDependencyTreeIsValid = false;
    },
    invalidateTags: tags => {
        tags.forEach(tag => {
            if (tag) {
                exports.invalidatedTags.add(tag);
            }
        });
    },
};

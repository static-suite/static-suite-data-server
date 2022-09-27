"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dependencyTagManager = exports.invalidatedTags = exports.dependencyTree = void 0;
exports.dependencyTree = new Map();
exports.invalidatedTags = new Set();
/**
 * Manager that keeps control of dependencies between data.
 */
exports.dependencyTagManager = {
    setDependency: (tag, dependsOnTags) => {
        const previousData = exports.dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags.forEach(dependsOnTag => previousData.add(dependsOnTag));
        }
        else {
            exports.dependencyTree.set(tag, new Set(dependsOnTags));
        }
    },
    deleteDependency: (tag, dependsOnTags) => {
        const previousData = exports.dependencyTree.get(tag);
        if (previousData) {
            dependsOnTags.forEach(dependsOnTag => previousData.delete(dependsOnTag));
            if (previousData.size === 0) {
                exports.dependencyTree.delete(tag);
            }
        }
    },
    invalidateTags: tags => {
        tags.forEach(tag => {
            exports.invalidatedTags.add(tag);
        });
    },
};

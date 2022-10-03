import { DependencyTagger, DependencyTree } from './dependency.types';

export const dependencyTree: DependencyTree = new Map<string, Set<string>>();

export const invalidatedTags = new Set<string>();

const reversedDependencyTree: DependencyTree = new Map<string, Set<string>>();

let reversedDependencyTreeIsValid = false;

/**
 * Makes a reverted version of the dependency tree
 *
 * @remarks Required to be able to search for dependencies in a fast way.
 */
export const getReversedDependencyTree = (): DependencyTree => {
  if (!reversedDependencyTreeIsValid) {
    reversedDependencyTree.clear();
    dependencyTree.forEach((children, parent) => {
      children.forEach(child => {
        const previousData = reversedDependencyTree.get(child);
        if (previousData) {
          previousData.add(parent);
        } else {
          reversedDependencyTree.set(child, new Set([parent]));
        }
      });
    });
    reversedDependencyTreeIsValid = true;
  }

  return reversedDependencyTree;
};

export const dependencyTagger: DependencyTagger = {
  setDependency: (tag, dependsOnTags) => {
    dependencyTree.set(tag, new Set(dependsOnTags));
    reversedDependencyTreeIsValid = false;
  },

  addDependency: (tag, dependsOnTags) => {
    const previousData = dependencyTree.get(tag);
    if (previousData) {
      dependsOnTags.forEach(dependsOnTag => previousData.add(dependsOnTag));
    } else {
      dependencyTree.set(tag, new Set(dependsOnTags));
    }
    reversedDependencyTreeIsValid = false;
  },

  deleteDependency: (tag, dependsOnTags) => {
    const previousData = dependencyTree.get(tag);
    if (previousData) {
      dependsOnTags?.forEach(dependsOnTag => previousData.delete(dependsOnTag));
      if (previousData.size === 0) {
        dependencyTree.delete(tag);
      }
    }
    reversedDependencyTreeIsValid = false;
  },

  invalidateTags: tags => {
    tags.forEach(tag => {
      if (tag) {
        invalidatedTags.add(tag);
      }
    });
  },
};

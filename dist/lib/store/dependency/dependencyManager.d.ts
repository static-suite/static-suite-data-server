import { DependencyManager } from './dependency.types';
/**
 * Gets a list of parents of a dependency tag
 */
export declare const getTagParents: (tag: string, parents?: Set<string>) => Set<string>;
/**
 * Gets a recursive list of invalidated tags.
 *
 * @remarks
 * Iterates over all explicitly invalidated tags, and obtains all
 * its parents.
 */
export declare const getAllInvalidatedTags: () => string[];
/**
 * Manager that keeps control of dependencies between data.
 */
export declare const dependencyManager: DependencyManager;
//# sourceMappingURL=dependencyManager.d.ts.map
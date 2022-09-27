import { DependencyTagger, DependencyTree } from './dependency.types';
export declare const dependencyTree: DependencyTree;
export declare const invalidatedTags: Set<string>;
/**
 * Makes a reverted version of the dependency tree
 *
 * @remarks Required to be able to search for dependencies in a fast way.
 */
export declare const getReversedDependencyTree: () => DependencyTree;
export declare const dependencyTagger: DependencyTagger;
//# sourceMappingURL=dependencyTagger.d.ts.map
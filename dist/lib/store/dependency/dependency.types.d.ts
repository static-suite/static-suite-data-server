/**
 * Service to define dependencies between data.
 */
export declare type DependencyTagger = {
    /**
     * Sets a dependency relationship between a tag that depends on another tags.
     *
     * @remarks It replaces any previous dependency relationship.
     *
     * @param tag - A tag to set a dependency for.
     * @param dependsOnTags - An array of tags that depends on first parameter tag.
     */
    setDependency(tag: string, dependsOnTags: string[]): void;
    /**
     * Adds a dependency relationship between a tag that depends on another tags.
     *
     * @remarks It adds data to any previous dependency relationship.
     *
     * @param tag - A tag to set a dependency for.
     * @param dependsOnTags - An array of tags that depends on first parameter tag.
     */
    addDependency(tag: string, dependsOnTags: string[]): void;
    /**
     * Deletes a dependency relationship between a tag that depends on another tags.
     *
     * @param tag - A tag to delete a dependency for.
     * @param dependsOnTags - Optional array of tags that depends on first parameter
     * tag. If not provided, it deletes all dependencies for tag.
     */
    deleteDependency(tag: string, dependsOnTags?: string[]): void;
    /**
     * Marks dependency items with any of the specified tags as invalid.
     *
     * @param tags - The list of tags for which to invalidate dependency items.
     */
    invalidateTags(tags: string[]): void;
};
/**
 * Manager that keeps control of dependencies between data.
 */
export declare type DependencyManager = {
    /**
     * Calculates and tracks down a list of filepaths which contain an invalidated tag.
     *
     * @remarks
     * It calculates which filepaths have been invalidated, and stores them so they
     * can be consumed later. This function should be called before the store is updated,
     * before any dependency data changes, to avoid losing the set of invalidated filepaths
     * between updates.
     */
    trackInvalidatedFilepaths(): void;
    /**
     * Gets a list of filepaths which contain an invalidated tag.
     *
     * @remarks
     * It uses the set of tracked down filepaths from
     *
     * @returns A list of filepaths which contain an invalidated tag.
     */
    getInvalidatedFilepaths(): {
        updated: string[];
        deleted: string[];
    };
    /**
     * Resets the list of invalidated tags once consumed.
     */
    reset(): void;
};
export declare type DependencyTree = Map<string, Set<string>>;
//# sourceMappingURL=dependency.types.d.ts.map
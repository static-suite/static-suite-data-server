import { Json } from '@lib/utils/object/object.types';
/**
 * Service that updates the include index that holds relationships between data.
 */
export declare type IncludeIndex = {
    /**
     * Sets include information for a file.
     *
     * @param relativeFilepath - Relative file path, inside dataDir, to the file to be set.
     * @param fileContents - Contents of the file to be set.
     */
    set(relativeFilepath: string, fileContents: Json): void;
    /**
     * Removes include information for a file.
     *
     * @param relativeFilepath - Relative file path, inside dataDir, to the file to be removed.
     * @param fileContents - Contents of the file to be removed.
     */
    remove(relativeFilepath: string, fileContents: Json): void;
    /**
     * Gets a recursive list of files containing a given file.
     *
     * @param relativeFilepath - Relative file path, inside dataDir, to the file to be searched for.
     *
     * @returns A list of files as an array of strings
     */
    getParents(relativeFilepath: string): string[];
};
//# sourceMappingURL=includeIndex.types.d.ts.map
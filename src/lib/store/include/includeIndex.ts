import { Json } from '@lib/utils/object/object.types';
import { IncludeIndex } from '@lib/store/include/includeIndex.types';
import { store } from '@lib/store';

/**
 * Helper method to get a recursive list of files containing a given file.
 *
 * @param relativeFilepath - Relative file path, inside dataDir, to the file to be searched for.
 * @param parentStack - Stack of already found parents.
 *
 * @returns A list of files as a Set of strings
 */
const getRecursiveParents = (
  relativeFilepath: string,
  parentStack: Set<string>,
): Set<string> => {
  const parents = store.index.include.static.get(relativeFilepath);
  if (parents) {
    parents.forEach((parentRelativeFilepath: string) => {
      parentStack.add(parentRelativeFilepath);
      getRecursiveParents(parentRelativeFilepath, parentStack);
    });
  }

  return parentStack;
};

/**
 * Service that updates the include index that holds relationships between data.
 */
export const includeIndex: IncludeIndex = {
  set: (relativeFilepath: string, fileContents: Json): void => {
    const staticIncludes = fileContents?.metadata?.includes?.static;
    // console.log('includeIndex.set() staticIncludes', staticIncludes);
    if (staticIncludes) {
      // console.log('includeIndex.set() INNNNNNN', relativeFilepath);
      Object.values(staticIncludes).forEach(
        (includeRelativeFilepath: string) => {
          const includeMap =
            store.index.include.static.get(includeRelativeFilepath) ||
            store.index.include.static
              .set(includeRelativeFilepath, new Set<string>())
              .get(includeRelativeFilepath);
          includeMap?.add(relativeFilepath);
        },
      );
    }

    const dynamicIncludes = fileContents?.metadata?.includes?.dynamic;
    if (dynamicIncludes) {
      // todo
    }
  },

  remove: (relativeFilepath: string, fileContents: Json): void => {
    const staticIncludes = fileContents?.metadata?.includes?.static;
    if (staticIncludes) {
      Object.values(staticIncludes).forEach(
        (includeRelativeFilepath: string) => {
          const includeMap =
            store.index.include.static.get(includeRelativeFilepath) ||
            store.index.include.static
              .set(includeRelativeFilepath, new Set<string>())
              .get(includeRelativeFilepath);
          if (includeMap) {
            includeMap.delete(relativeFilepath);
            // console.log('includeIndex.remove()', relativeFilepath);
            if (includeMap.size === 0) {
              store.index.include.static.delete(includeRelativeFilepath);
            }
          }
        },
      );
    }

    const dynamicIncludes = fileContents?.metadata?.includes?.dynamic;
    if (dynamicIncludes) {
      // todo
    }
  },

  getParents: (relativeFilepath: string): string[] =>
    Array.from(getRecursiveParents(relativeFilepath, new Set<string>())),
};

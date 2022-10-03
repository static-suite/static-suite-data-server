import { Json } from '@lib/utils/object/object.types';
import { dependencyTagger } from './dependencyTagger';

export const dependencyIncludeHelper = {
  addIncludeDependencies: (filepath: string, json: Json): void => {
    const includes = json?.metadata?.includes;

    if (includes?.static) {
      const staticIncludes = Object.values(includes?.static);
      dependencyTagger.addDependency(filepath, staticIncludes);
    }

    if (includes?.dynamic) {
      const dynamicIncludes = Object.values(includes?.dynamic);
      dependencyTagger.addDependency(filepath, dynamicIncludes);
      // Queries are invalidated by any data change until they are executed,
      // when they return their dependencies. They are "globally invalidable" when:
      // 1) Are added for the first time
      // 2) Are updated: file can contain another query include,
      //    or different parameters, etc
      // In another words:
      // 1) When a file with a query is loaded for he first time,
      //    that query has a dependency on "*"
      // 2) When that query is executed, it has a dependency on "node:1234"
      // 3) When that file with a query is updated, the query has again a dependency on "*"
      dynamicIncludes.forEach(queryDefinition => {
        // This is explicity a "set" operation, because query dependencies are
        // only set from a query's "tags" field.
        dependencyTagger.setDependency(queryDefinition, ['*']);
      });
    }
  },

  deleteIncludeDependencies: (filepath: string, json: Json): void => {
    const includes = json?.metadata?.includes;

    if (includes?.static) {
      const staticIncludes = Object.values(includes?.static);
      dependencyTagger.deleteDependency(filepath, staticIncludes);
    }

    if (includes?.dynamic) {
      const dynamicIncludes = Object.values(includes?.dynamic);
      dependencyTagger.deleteDependency(filepath, dynamicIncludes);
      // Queries are invalidated by any data change until they are executed,
      // when they return their dependencies. Remove that dependency if still present.
      dynamicIncludes.forEach(queryDefinition => {
        dependencyTagger.deleteDependency(queryDefinition, ['*']);
      });
    }
  },
};

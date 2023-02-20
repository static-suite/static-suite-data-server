import { Json } from '../../utils/object/object.types';
import { IncludeParser } from './includeParser.types';
import {
  configIncludeParser,
  customIncludeParser,
  entityIncludeParser,
  localeIncludeParser,
  queryIncludeParser,
  // queryIncludeParser,
} from './parsers';
import { store } from '..';

export const includeParser: IncludeParser = {
  static: (relativeFilepath: string, host: Json): void => {
    const staticIncludes = host?.metadata?.includes?.static;
    if (!staticIncludes) {
      return;
    }
    Object.keys(staticIncludes).forEach((includePath: string) => {
      const mountPath = includePath.split('.');
      const normalizedIncludePath = includePath.toLowerCase();
      const includeKey = mountPath.pop();
      if (includeKey) {
        // All static includes share the same strategy, where the
        // includePath gives access to the final target to be included.
        const targetKey = staticIncludes[includePath];
        const target = store.data.get(targetKey);
        if (normalizedIncludePath.endsWith('configinclude')) {
          configIncludeParser({ host, target, mountPath, includeKey });
        }
        if (normalizedIncludePath.endsWith('entityinclude')) {
          entityIncludeParser({ host, target, mountPath, includeKey });
        }
        if (normalizedIncludePath.endsWith('custominclude')) {
          customIncludeParser({ host, target, mountPath, includeKey });
        }
        if (normalizedIncludePath.endsWith('localeinclude')) {
          localeIncludeParser({ host, target, mountPath, includeKey });
        }
      }
    });
  },

  dynamic: (host: Json): void => {
    const dynamicIncludes = host?.metadata?.includes?.dynamic;
    if (!dynamicIncludes) {
      return;
    }
    Object.keys(dynamicIncludes).forEach((includePath: string) => {
      // No need to check if it is a query include.
      queryIncludeParser({ host, includePath });
    });
  },
};

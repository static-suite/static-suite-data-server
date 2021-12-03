import { Json } from '@lib/utils/object/object.types';
import { getObjValue } from '@lib/utils/object';
import { IncludeParser } from './includeParser.types';
import {
  configIncludeParser,
  customIncludeParser,
  entityIncludeParser,
  localeIncludeParser,
  queryIncludeParser,
} from './parsers';
import { store } from '..';

export const includeParser: IncludeParser = {
  static: (host: Json): void => {
    host?.metadata?.includes?.static?.forEach((includePath: string) => {
      const mountPath = includePath.split('.');
      const normalizedIncludePath = includePath.toLowerCase();
      const includeKey = mountPath.pop();
      if (includeKey) {
        // All static includes share the same strategy, where the
        // includePath gives access to the final target to be included.
        const targetKey = getObjValue(host, includePath);
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
    host?.metadata?.includes?.dynamic?.forEach((includePath: string) => {
      // No need to check if it is a query include.
      queryIncludeParser({ host, includePath });
    });
  },
};

import { GenericIncludeParserOptions } from '../../includeParser.types';
import { getObjValue } from '../../../../utils/object';
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
export const aliasWithoutTypeIncludeParser = (
  { host, target, mountPath, includeKey }: GenericIncludeParserOptions,
  type: string,
): void => {
  const mountPoint = getObjValue(host, mountPath);
  const mountPointKey =
    includeKey.replace('Include', '') === type
      ? type
      : includeKey.replace(
          `${type.charAt(0).toUpperCase() + type.slice(1)}Include`,
          '',
        );
  mountPoint[mountPointKey] = target;
  delete mountPoint[includeKey];
};

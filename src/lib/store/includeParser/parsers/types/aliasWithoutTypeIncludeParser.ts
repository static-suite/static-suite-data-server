import { GenericIncludeParserOptions } from '@lib/store/includeParser/includeParser.types';
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
export const aliasWithoutTypeIncludeParser = (
  { host, target, mountPath, includeKey }: GenericIncludeParserOptions,
  type: string,
): void => {
  const mountPoint = mountPath.reduce(
    (previous: any, current: any) => previous?.[current],
    host,
  );
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

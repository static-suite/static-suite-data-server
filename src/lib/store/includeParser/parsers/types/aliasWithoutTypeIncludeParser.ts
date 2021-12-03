import { GenericIncludeParserOptions } from '@lib/store/includeParser/includeParser.types';
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
export const aliasWithoutTypeIncludeParser = (
  options: GenericIncludeParserOptions,
  type: string,
): void => {
  const {
    host: fileContent,
    target: includeData,
    mountPath: mountPointPath,
    includeKey,
  } = options;

  const mountPoint = mountPointPath.reduce(
    (previous: any, current: any) => previous?.[current],
    fileContent,
  );
  const mountPointKey =
    includeKey.replace('Include', '') === type
      ? type
      : includeKey.replace(
          `${type.charAt(0).toUpperCase() + type.slice(1)}Include`,
          '',
        );
  mountPoint[mountPointKey] = includeData;
  delete mountPoint[includeKey];
};

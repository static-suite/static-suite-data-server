import { IncludeParserOptions } from '@lib/store/includeParser/includeParser.types';

export const aliasWithoutTypeIncludeParser = (
  {
    fileContent,
    includeData,
    mountPointPath,
    includeKey,
  }: IncludeParserOptions,
  type: string,
): void => {
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

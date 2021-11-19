import { IncludeParserOptions } from '@lib/store/includeParser/includeParser.types';

export const aliasIncludeParser = ({
  fileContent,
  includeData,
  mountPointPath,
  includeKey,
}: IncludeParserOptions): void => {
  const mountPoint = mountPointPath.reduce(
    (previous: any, current: any) => previous?.[current],
    fileContent,
  );
  mountPoint[includeKey.replace('Include', '')] = includeData;
  delete mountPoint[includeKey];
};

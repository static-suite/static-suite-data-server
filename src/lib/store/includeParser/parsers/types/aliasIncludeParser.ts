import { GenericIncludeParserOptions } from '@lib/store/includeParser/includeParser.types';

export const aliasIncludeParser = ({
  host: fileContent,
  target: includeData,
  mountPath: mountPointPath,
  includeKey,
}: GenericIncludeParserOptions): void => {
  const mountPoint = mountPointPath.reduce(
    (previous: any, current: any) => previous?.[current],
    fileContent,
  );
  mountPoint[includeKey.replace('Include', '')] = includeData;
  delete mountPoint[includeKey];
};

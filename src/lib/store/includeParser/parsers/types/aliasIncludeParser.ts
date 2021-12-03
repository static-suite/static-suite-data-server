import { GenericIncludeParserOptions } from '@lib/store/includeParser/includeParser.types';

export const aliasIncludeParser = ({
  host,
  target,
  mountPath,
  includeKey,
}: GenericIncludeParserOptions): void => {
  const mountPoint = mountPath.reduce(
    (previous: any, current: any) => previous?.[current],
    host,
  );
  mountPoint[includeKey.replace('Include', '')] = target;
  delete mountPoint[includeKey];
};

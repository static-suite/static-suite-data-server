import { GenericIncludeParserOptions } from '@lib/store/include/includeParser.types';
import { getObjValue } from '@lib/utils/object';

export const aliasIncludeParser = ({
  host,
  target,
  mountPath,
  includeKey,
}: GenericIncludeParserOptions): void => {
  const mountPoint = getObjValue(host, mountPath);
  mountPoint[includeKey.replace('Include', '')] = target;
  delete mountPoint[includeKey];
};

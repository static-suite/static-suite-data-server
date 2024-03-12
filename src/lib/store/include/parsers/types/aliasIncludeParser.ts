import { GenericIncludeParserOptions } from '../../includeParser.types';
import { getObjValue } from '../../../../utils/object';

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

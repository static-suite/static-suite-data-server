import { getObjValue } from '../../../utils/object';
import { EntityIncludeParserOptions } from '../includeParser.types';

export const entityIncludeParser = ({
  host,
  target,
  mountPath,
}: EntityIncludeParserOptions): void => {
  // Remove a level from mountPath, to mount entity a level up.
  const includeKey = mountPath.pop();
  if (includeKey) {
    const mountPoint = getObjValue(host, mountPath);
    mountPoint[includeKey] = target?.data?.content;
  }
};

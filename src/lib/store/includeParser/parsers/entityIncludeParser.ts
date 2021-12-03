import { EntityIncludeParserOptions } from '../includeParser.types';

export const entityIncludeParser = ({
  host,
  target,
  mountPath,
}: EntityIncludeParserOptions): void => {
  const includeKey = mountPath.pop();
  if (includeKey) {
    const mountPoint = mountPath.reduce(
      (previous: any, current: any) => previous?.[current],
      host,
    );
    mountPoint[includeKey] = target.data?.content;
  }
};

import { GenericIncludeParserOptions } from '../includeParser.types';
import { aliasIncludeParser } from './types/aliasIncludeParser';

export const configIncludeParser = (
  options: GenericIncludeParserOptions,
): void => {
  aliasIncludeParser(options);
};

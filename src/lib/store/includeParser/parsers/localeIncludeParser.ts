import { GenericIncludeParserOptions } from '../includeParser.types';
import { aliasIncludeParser } from './types/aliasIncludeParser';

export const localeIncludeParser = (
  options: GenericIncludeParserOptions,
): void => {
  aliasIncludeParser(options);
};

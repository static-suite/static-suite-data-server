import { IncludeParserOptions } from '../includeParser.types';
import { aliasIncludeParser } from './types/aliasIncludeParser';

export const localeIncludeParser = (options: IncludeParserOptions): void => {
  aliasIncludeParser(options);
};

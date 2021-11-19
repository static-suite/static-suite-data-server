import { IncludeParserOptions } from '../includeParser.types';
import { aliasIncludeParser } from './types/aliasIncludeParser';

export const configIncludeParser = (options: IncludeParserOptions): void => {
  aliasIncludeParser(options);
};

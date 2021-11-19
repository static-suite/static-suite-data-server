import { IncludeParserOptions } from '../includeParser.types';
import { aliasWithoutTypeIncludeParser } from './types/aliasWithoutTypeIncludeParser';

export const customIncludeParser = (options: IncludeParserOptions): void => {
  aliasWithoutTypeIncludeParser(options, 'custom');
};

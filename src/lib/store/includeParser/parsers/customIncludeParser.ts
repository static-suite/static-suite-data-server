import { GenericIncludeParserOptions } from '../includeParser.types';
import { aliasWithoutTypeIncludeParser } from './types/aliasWithoutTypeIncludeParser';

export const customIncludeParser = (
  options: GenericIncludeParserOptions,
): void => {
  aliasWithoutTypeIncludeParser(options, 'custom');
};

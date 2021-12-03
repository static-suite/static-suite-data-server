import { logger } from '@lib/utils/logger';
import { parseJsonString, parseURLSearchParams } from '../stringUtils';

describe('String utils test', () => {
  describe('parseJsonString', () => {
    logger.error = jest.fn();
    it('parses a well-formed JSON string without logging any error', () => {
      expect(parseJsonString('{"key": "value"}')).not.toBeNull();
      expect(logger.error).not.toHaveBeenCalled();
    });
    it('logs an error when parsing a malformed JSON string', () => {
      expect(parseJsonString('malformed-json-string')).toBeNull();
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('parseURLSearchParams', () => {
    it('parses a query string with non repeated keys and returns an object', () => {
      const parsedQuery = parseURLSearchParams('arg1=a&arg2=b');
      const expectedValue = { arg1: 'a', arg2: 'b' };
      expect(parsedQuery).toStrictEqual(expectedValue);
    });

    it('parses a query string with repeated keys and returns an object', () => {
      const parsedQuery = parseURLSearchParams('arg1=a&arg2=b&arg1=c');
      const expectedValue = { arg1: ['a', 'c'], arg2: 'b' };
      expect(parsedQuery).toEqual(expectedValue);
    });
  });
});

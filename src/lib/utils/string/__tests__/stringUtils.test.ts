import { logger } from '../../logger';
import {
  isUniqueId,
  parseJsonString,
  parseUniqueId,
  parseURLSearchParams,
} from '../stringUtils';

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

  describe('parseUniqueId', () => {
    it('parses a valid unique id and returns a date', () => {
      const uniqueIdDate = parseUniqueId('2022-09-28_11-42-00.001712__7220');
      // Depending on the time of year (Daylight saving time or not), parsing
      // a unique id returns a different date. This test checks both possible values.
      expect([1664365320001, 1664361720001]).toContain(uniqueIdDate?.getTime());
    });

    it('parses a non valid unique id and returns null', () => {
      const uniqueIdDate = parseUniqueId('non valid unique id');
      expect(uniqueIdDate).toEqual(null);
    });
  });

  describe('isUniqueId', () => {
    it('returns true for a valid unique id', () => {
      const result = isUniqueId('2022-09-28_11-42-00.001712__7220');
      expect(result).toEqual(true);
    });

    it('returns false for a non valid unique id', () => {
      const result = isUniqueId('non valid unique id');
      expect(result).toEqual(false);
    });
  });
});

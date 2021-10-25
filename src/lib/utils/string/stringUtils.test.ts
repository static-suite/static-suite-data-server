import { logger } from '@lib/utils/logger';
import { parseJsonString, getVariantKey } from './stringUtils';

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

  describe('getVariantKey', () => {
    it('gets a variant key from a valid path', () => {
      expect(getVariantKey('/absolute/path/to/example--variant.json')).toBe(
        'variant',
      );
    });
    it('gets null from a non-valid path', () => {
      expect(
        getVariantKey('/absolute/path/to/example__variant.json'),
      ).toBeNull();
    });
  });
});

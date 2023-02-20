import { logger } from '../logger';

describe('Logger utils test', () => {
  describe('logger', () => {
    it('is an object with at least four functions: error, warn, info and debug', () => {
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });
});

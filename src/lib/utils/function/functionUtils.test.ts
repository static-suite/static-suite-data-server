import { getArgs } from './functionUtils';

describe('lib/utils/function/functionUtils test', () => {
  describe('getArgs', () => {
    it(`get the args of a function`, () => {
      expect(
        getArgs((x: string, y: string, z: string) => `${x} ${y} ${z}`),
      ).toEqual(['x', 'y', 'z']);
    });
  });
});

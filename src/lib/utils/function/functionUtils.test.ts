import { getArgs } from './functionUtils';

describe('Function utils test', () => {
  describe('getArgs', () => {
    it(`gets the arguments of a function`, () => {
      expect(
        getArgs((x: string, y: string, z: string) => `${x} ${y} ${z}`),
      ).toEqual(['x', 'y', 'z']);
    });
  });
});

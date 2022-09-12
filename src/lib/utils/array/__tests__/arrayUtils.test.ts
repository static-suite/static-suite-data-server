import { arrayRemoveByValue } from '../arrayUtils';

describe('Array utils test', () => {
  describe('arrayRemoveByValue', () => {
    it('removes an existing array item by value', () => {
      const arr = [1, 2, 3];
      arrayRemoveByValue(arr, 2);
      expect(arr).toEqual([1, 3]);
    });
    it('leaves untouched an array when removing a non existing array item by value', () => {
      const arr = [1, 2, 3];
      arrayRemoveByValue(arr, 4);
      expect(arr).toEqual([1, 2, 3]);
    });
  });
});

import { isEmptyObject, hasKey, deepClone } from '../objectUtils';

describe('Objsct utils test', () => {
  describe('isEmptyObject', () => {
    it('gets true on empty object', () => {
      expect(isEmptyObject({})).toBeTruthy();
    });
    it('gets false on non empty object', () => {
      expect(isEmptyObject({ x: 1 })).toBeFalsy();
    });
  });
  describe('hasKey', () => {
    it('gets true on when an object has the key', () => {
      expect(hasKey({ x: 1 }, 'x')).toBeTruthy();
    });
    it('gets false on when an object has not the key', () => {
      expect(hasKey({ x: 1 }, 'y')).toBeFalsy();
    });
  });
  describe('deepClone', () => {
    it('returns an object equal to the given without references to nested objects', () => {
      const anObject = { x: 1, y: {} };
      const anotherObject = { z: 34 };
      anObject.y = anotherObject;
      const clonedObject = deepClone(anObject);
      expect(clonedObject).toStrictEqual(anObject);
      anotherObject.z = 22;
      expect(clonedObject).not.toStrictEqual(anObject);
    });
  });
});

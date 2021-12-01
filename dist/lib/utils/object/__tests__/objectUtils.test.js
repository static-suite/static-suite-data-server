"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
const objectUtils_1 = require("../objectUtils");
describe('Object utils test', () => {
    describe('isEmptyObject', () => {
        it('returns true for an empty object', () => {
            expect((0, objectUtils_1.isEmptyObject)({})).toBe(true);
        });
        it('returns false for a non empty object', () => {
            expect((0, objectUtils_1.isEmptyObject)({ x: 1 })).toBe(false);
        });
    });
    describe('hasKey', () => {
        it('returns true if an object has a given key', () => {
            expect((0, objectUtils_1.hasKey)({ x: 1 }, 'x')).toBe(true);
        });
        it('returns false if an object does not have a given key', () => {
            expect((0, objectUtils_1.hasKey)({ x: 1 }, 'y')).toBe(false);
        });
    });
    describe('deepClone', () => {
        it('returns an object equal to the given one, without references to nested objects', () => {
            const anObject = { x: 1, y: {} };
            const anotherObject = { z: 34 };
            anObject.y = anotherObject;
            const clonedObject = (0, objectUtils_1.deepClone)(anObject);
            expect(clonedObject).toStrictEqual(anObject);
            anotherObject.z = 22;
            expect(clonedObject).not.toStrictEqual(anObject);
        });
    });
    describe('getObjectValue', () => {
        const testObject = { x: { y: { z: 'xx' } } };
        it('gets object value with default separator', () => {
            expect((0, __1.getObjectValue)(testObject, 'x.y.z')).toBe('xx');
        });
        it('gets object value with custom separator', () => {
            expect((0, __1.getObjectValue)(testObject, 'x/y/z', '/')).toBe('xx');
        });
        it('gets undefined when path does not exist', () => {
            expect((0, __1.getObjectValue)(testObject, 'x.z.z')).toBeUndefined();
        });
    });
});

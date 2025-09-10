"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../../logger");
const stringUtils_1 = require("../stringUtils");
describe('String utils test', () => {
    describe('parseJsonString', () => {
        logger_1.logger.error = jest.fn();
        it('parses a well-formed JSON string without logging any error', () => {
            expect((0, stringUtils_1.parseJsonString)('{"key": "value"}')).not.toBeNull();
            expect(logger_1.logger.error).not.toHaveBeenCalled();
        });
        it('logs an error when parsing a malformed JSON string', () => {
            expect((0, stringUtils_1.parseJsonString)('malformed-json-string')).toBeNull();
            expect(logger_1.logger.error).toHaveBeenCalled();
        });
    });
    describe('parseURLSearchParams', () => {
        it('parses a query string with non repeated keys and returns an object', () => {
            const parsedQuery = (0, stringUtils_1.parseURLSearchParams)('arg1=a&arg2=b');
            const expectedValue = { arg1: 'a', arg2: 'b' };
            expect(parsedQuery).toStrictEqual(expectedValue);
        });
        it('parses a query string with repeated keys and returns an object', () => {
            const parsedQuery = (0, stringUtils_1.parseURLSearchParams)('arg1=a&arg2=b&arg1=c');
            const expectedValue = { arg1: ['a', 'c'], arg2: 'b' };
            expect(parsedQuery).toEqual(expectedValue);
        });
    });
    describe('parseUniqueId', () => {
        it('parses a valid unique id and returns a date', () => {
            const uniqueIdDate = (0, stringUtils_1.parseUniqueId)('2022-09-28_11-42-00.001712__7220');
            // Depending on the time of year (Daylight saving time or not), parsing
            // a unique id returns a different date. This test checks both possible values.
            expect([1664365320001, 1664361720001]).toContain(uniqueIdDate?.getTime());
        });
        it('parses a non valid unique id and returns null', () => {
            const uniqueIdDate = (0, stringUtils_1.parseUniqueId)('non valid unique id');
            expect(uniqueIdDate).toEqual(null);
        });
    });
    describe('isUniqueId', () => {
        it('returns true for a valid unique id', () => {
            const result = (0, stringUtils_1.isUniqueId)('2022-09-28_11-42-00.001712__7220');
            expect(result).toEqual(true);
        });
        it('returns false for a non valid unique id', () => {
            const result = (0, stringUtils_1.isUniqueId)('non valid unique id');
            expect(result).toEqual(false);
        });
    });
});

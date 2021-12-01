"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@lib/utils/logger");
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
    describe('getVariantKey', () => {
        it('gets a variant key from a valid path', () => {
            expect((0, stringUtils_1.getVariantKey)('/absolute/path/to/example--variant.json')).toBe('variant');
        });
        it('gets null from a non-valid path', () => {
            expect((0, stringUtils_1.getVariantKey)('/absolute/path/to/example__variant.json')).toBeNull();
        });
    });
});

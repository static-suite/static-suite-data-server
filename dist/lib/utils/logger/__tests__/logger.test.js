"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("@lib/utils/logger");
describe('Logger utils test', () => {
    describe('logger', () => {
        it('is an object with at least four functions: error, warn, info and debug', () => {
            expect(typeof logger_1.logger.error).toBe('function');
            expect(typeof logger_1.logger.warn).toBe('function');
            expect(typeof logger_1.logger.info).toBe('function');
            expect(typeof logger_1.logger.debug).toBe('function');
        });
    });
});

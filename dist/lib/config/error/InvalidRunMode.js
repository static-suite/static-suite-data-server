"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidRunMode = void 0;
const DomainError_1 = require("@lib/error/DomainError");
/**
 * Defines a custom error for invalid run modes.
 *
 * @internal
 */
class InvalidRunMode extends DomainError_1.DomainError {
    /**
     * Constructs a new error for invalid run modes.
     *
     * @param runMode - the value of the invalid runMode.
     */
    constructor(runMode) {
        super(`Invalid value provided for "runMode": "${runMode}"`);
    }
}
exports.InvalidRunMode = InvalidRunMode;

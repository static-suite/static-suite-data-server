"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingRequiredOption = void 0;
const DomainError_1 = require("../../error/DomainError");
/**
 * Defines a custom error for missing required options.
 *
 * @internal
 */
class MissingRequiredOption extends DomainError_1.DomainError {
    /**
     * Constructs a new error for missing required options.
     *
     * @param requiredOption - the name of the missing required option.
     */
    constructor(requiredOption) {
        super(`Required option not provided: "${requiredOption}".`);
        this.requiredOption = requiredOption;
    }
}
exports.MissingRequiredOption = MissingRequiredOption;

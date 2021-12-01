import { DomainError } from '@lib/error/DomainError';
/**
 * Defines a custom error for missing required options.
 *
 * @internal
 */
export declare class MissingRequiredOption extends DomainError {
    /**
     * The name of the missing required option.
     */
    requiredOption: string;
    /**
     * Constructs a new error for missing required options.
     *
     * @param requiredOption - the name of the missing required option.
     */
    constructor(requiredOption: string);
}
//# sourceMappingURL=MissingRequiredOption.d.ts.map
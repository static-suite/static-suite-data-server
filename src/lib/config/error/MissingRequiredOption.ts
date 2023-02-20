import { DomainError } from '../../error/DomainError';

/**
 * Defines a custom error for missing required options.
 *
 * @internal
 */
export class MissingRequiredOption extends DomainError {
  /**
   * The name of the missing required option.
   */
  requiredOption: string;

  /**
   * Constructs a new error for missing required options.
   *
   * @param requiredOption - the name of the missing required option.
   */
  constructor(requiredOption: string) {
    super(`Required option not provided: "${requiredOption}".`);
    this.requiredOption = requiredOption;
  }
}

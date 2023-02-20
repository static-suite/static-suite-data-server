import { DomainError } from '../../error/DomainError';
/**
 * Defines a custom error for non-writable directories.
 *
 * @internal
 */
export declare class NonWritableDirectory extends DomainError {
    /**
     * The configuration id of the non-writable directory (dataDir, queryDir, etc).
     */
    directoryId: string;
    /**
     * Path of the non-writable directory.
     */
    path: string;
    /**
     * Constructs a new error for non-writable directories.
     *
     * @param directoryId - the configuration id of the non-writable directory (dataDir, queryDir, etc).
     * @param path - the path of the non-writable directory.
     */
    constructor(directoryId: string, path: string);
}
//# sourceMappingURL=NonWritableDirectory.d.ts.map
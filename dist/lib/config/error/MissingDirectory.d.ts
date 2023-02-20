import { DomainError } from '../../error/DomainError';
/**
 * Defines a custom error for missing directories.
 *
 * @internal
 */
export declare class MissingDirectory extends DomainError {
    /**
     * The configuration id of the missing directory (dataDir, queryDir, etc).
     */
    directoryId: string;
    /**
     * Path of the missing directory.
     */
    path: string;
    /**
     * Constructs a new error for missing directories.
     *
     * @param directoryId - the configuration id of the missing directory (dataDir, queryDir, etc).
     * @param path - the path of the missing directory.
     */
    constructor(directoryId: string, path: string);
}
//# sourceMappingURL=MissingDirectory.d.ts.map
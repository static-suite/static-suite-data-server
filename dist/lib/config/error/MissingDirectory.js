"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissingDirectory = void 0;
const DomainError_1 = require("@lib/error/DomainError");
/**
 * Defines a custom error for missing directories.
 *
 * @internal
 */
class MissingDirectory extends DomainError_1.DomainError {
    /**
     * Constructs a new error for missing directories.
     *
     * @param directoryId - the configuration id of the missing directory (dataDir, queryDir, etc).
     * @param path - the path of the missing directory.
     */
    constructor(directoryId, path) {
        super(`Cannot find "${directoryId}" directory: "${path}"`);
        this.directoryId = directoryId;
        this.path = path;
    }
}
exports.MissingDirectory = MissingDirectory;

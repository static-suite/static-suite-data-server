"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NonWritableDirectory = void 0;
const DomainError_1 = require("@lib/error/DomainError");
/**
 * Defines a custom error for non-writable directories.
 *
 * @internal
 */
class NonWritableDirectory extends DomainError_1.DomainError {
    /**
     * Constructs a new error for non-writable directories.
     *
     * @param directoryId - the configuration id of the non-writable directory (dataDir, queryDir, etc).
     * @param path - the path of the non-writable directory.
     */
    constructor(directoryId, path) {
        super(`Directory "${directoryId}" is not writable: "${path}"`);
        this.directoryId = directoryId;
        this.path = path;
    }
}
exports.NonWritableDirectory = NonWritableDirectory;

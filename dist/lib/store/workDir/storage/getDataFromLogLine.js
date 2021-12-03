"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromLogLine = void 0;
/**
 * Extract information from Static Suite's log line.
 *
 * @param line - Log line.
 *
 * @returns An object with parsed data, or null if line format is not valid.
 */
const getDataFromLogLine = (line) => {
    const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)/);
    if (matches) {
        const uniqueId = matches[1];
        const operation = matches[2];
        const fileId = matches[3];
        const [fileLabel, uri] = matches[4].split(' | ');
        const [, uriTarget] = uri.split('://');
        if (operation === 'write' || operation === 'delete') {
            return {
                uniqueId,
                operation,
                file: {
                    id: fileId,
                    label: fileLabel,
                    relativePath: uriTarget,
                },
            };
        }
    }
    return null;
};
exports.getDataFromLogLine = getDataFromLogLine;

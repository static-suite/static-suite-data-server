"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataFromLogLine = void 0;
/**
 * Extract information from metadata log line.
 *
 * @param {string} line - Log line.
 *
 * @return {(Object)} - An object with parsed data.
 */
const getDataFromLogLine = (line) => {
    const matches = line.match(/^(\S+) (\S+) \[ID: ([^\]]+)] (.+)/);
    if (matches) {
        const uniqueId = matches[1];
        const operation = matches[2];
        const fileId = matches[3];
        const [fileLabel, uri] = matches[4].split(' | ');
        const [, uriTarget] = uri.split('://');
        return {
            uniqueId,
            operation,
            file: {
                id: fileId,
                label: fileLabel,
                path: uriTarget,
            },
        };
    }
    return null;
};
exports.getDataFromLogLine = getDataFromLogLine;

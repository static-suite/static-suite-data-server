"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracker = void 0;
const includeIndex_1 = require("../include/includeIndex");
/**
 * A list of changed files with includes that have changed since last reset.
 */
const changedFiles = new Set();
exports.tracker = {
    trackChangedFile(relativeFilepath) {
        // Add parents.
        includeIndex_1.includeIndex
            .getParents(relativeFilepath)
            .forEach((parentRelativeFilepath) => {
            changedFiles.add(parentRelativeFilepath);
        });
        // Add the passed file.
        changedFiles.add(relativeFilepath);
    },
    getChangedFiles: () => Array.from(changedFiles),
    reset: () => {
        changedFiles.clear();
    },
};

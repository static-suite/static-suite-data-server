"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracker = void 0;
const includeIndex_1 = require("../include/includeIndex");
const trackedChangedFiles = new Set();
exports.tracker = {
    trackChangedFile(file) {
        // Add parents.
        includeIndex_1.includeIndex.getParents(file).forEach((parent) => {
            trackedChangedFiles.add(parent);
        });
        // Add the passed file.
        trackedChangedFiles.add(file);
    },
    getChangedFiles: () => Array.from(trackedChangedFiles),
    reset: () => {
        trackedChangedFiles.clear();
    },
};

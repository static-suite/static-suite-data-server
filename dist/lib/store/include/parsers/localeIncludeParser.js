"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localeIncludeParser = void 0;
const aliasIncludeParser_1 = require("./types/aliasIncludeParser");
const localeIncludeParser = (options) => {
    (0, aliasIncludeParser_1.aliasIncludeParser)(options);
};
exports.localeIncludeParser = localeIncludeParser;

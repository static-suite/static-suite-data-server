"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configIncludeParser = void 0;
const aliasIncludeParser_1 = require("./types/aliasIncludeParser");
const configIncludeParser = (options) => {
    (0, aliasIncludeParser_1.aliasIncludeParser)(options);
};
exports.configIncludeParser = configIncludeParser;

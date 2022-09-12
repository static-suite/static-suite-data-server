"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customIncludeParser = void 0;
const aliasWithoutTypeIncludeParser_1 = require("./types/aliasWithoutTypeIncludeParser");
const customIncludeParser = (options) => {
    (0, aliasWithoutTypeIncludeParser_1.aliasWithoutTypeIncludeParser)(options, 'custom');
};
exports.customIncludeParser = customIncludeParser;

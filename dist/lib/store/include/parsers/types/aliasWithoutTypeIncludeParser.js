"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasWithoutTypeIncludeParser = void 0;
const object_1 = require("../../../../utils/object");
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
const aliasWithoutTypeIncludeParser = ({ host, target, mountPath, includeKey }, type) => {
    const mountPoint = (0, object_1.getObjValue)(host, mountPath);
    const mountPointKey = includeKey.replace('Include', '') === type
        ? type
        : includeKey.replace(`${type.charAt(0).toUpperCase() + type.slice(1)}Include`, '');
    mountPoint[mountPointKey] = target;
    delete mountPoint[includeKey];
};
exports.aliasWithoutTypeIncludeParser = aliasWithoutTypeIncludeParser;

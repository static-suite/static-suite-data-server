"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasWithoutTypeIncludeParser = void 0;
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
const aliasWithoutTypeIncludeParser = (options, type) => {
    const { host: fileContent, target: includeData, mountPath: mountPointPath, includeKey, } = options;
    const mountPoint = mountPointPath.reduce((previous, current) => previous?.[current], fileContent);
    const mountPointKey = includeKey.replace('Include', '') === type
        ? type
        : includeKey.replace(`${type.charAt(0).toUpperCase() + type.slice(1)}Include`, '');
    mountPoint[mountPointKey] = includeData;
    delete mountPoint[includeKey];
};
exports.aliasWithoutTypeIncludeParser = aliasWithoutTypeIncludeParser;

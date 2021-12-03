"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasWithoutTypeIncludeParser = void 0;
/**
 *
 * @param options - Object with options as defined in @see {@link IncludeParserOptions}
 * @param type - Type of include (custom, query, etc)
 */
const aliasWithoutTypeIncludeParser = ({ host, target, mountPath, includeKey }, type) => {
    const mountPoint = mountPath.reduce((previous, current) => previous?.[current], host);
    const mountPointKey = includeKey.replace('Include', '') === type
        ? type
        : includeKey.replace(`${type.charAt(0).toUpperCase() + type.slice(1)}Include`, '');
    mountPoint[mountPointKey] = target;
    delete mountPoint[includeKey];
};
exports.aliasWithoutTypeIncludeParser = aliasWithoutTypeIncludeParser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityIncludeParser = void 0;
const entityIncludeParser = ({ host, target, mountPath, }) => {
    const includeKey = mountPath.pop();
    if (includeKey) {
        const mountPoint = mountPath.reduce((previous, current) => previous?.[current], host);
        mountPoint[includeKey] = target.data?.content;
    }
};
exports.entityIncludeParser = entityIncludeParser;

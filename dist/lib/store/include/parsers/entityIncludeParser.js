"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.entityIncludeParser = void 0;
const object_1 = require("../../../utils/object");
const entityIncludeParser = ({ host, target, mountPath, }) => {
    // Remove a level from mountPath, to mount entity a level up.
    const includeKey = mountPath.pop();
    if (includeKey) {
        const mountPoint = (0, object_1.getObjValue)(host, mountPath);
        mountPoint[includeKey] = target?.data?.content;
    }
};
exports.entityIncludeParser = entityIncludeParser;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasIncludeParser = void 0;
const object_1 = require("../../../../utils/object");
const aliasIncludeParser = ({ host, target, mountPath, includeKey, }) => {
    const mountPoint = (0, object_1.getObjValue)(host, mountPath);
    mountPoint[includeKey.replace('Include', '')] = target;
    delete mountPoint[includeKey];
};
exports.aliasIncludeParser = aliasIncludeParser;

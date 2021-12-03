"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeParser = void 0;
const object_1 = require("@lib/utils/object");
const parsers_1 = require("./parsers");
const __1 = require("..");
exports.includeParser = {
    static: (host) => {
        host?.metadata?.includes?.static?.forEach((includePath) => {
            const mountPath = includePath.split('.');
            const normalizedIncludePath = includePath.toLowerCase();
            const includeKey = mountPath.pop();
            if (includeKey) {
                // All static includes share the same strategy, where the
                // includePath gives access to the final target to be included.
                const targetKey = (0, object_1.getObjValue)(host, includePath);
                const target = __1.store.data.get(targetKey);
                if (normalizedIncludePath.endsWith('configinclude')) {
                    (0, parsers_1.configIncludeParser)({ host, target, mountPath, includeKey });
                }
                if (normalizedIncludePath.endsWith('entityinclude')) {
                    (0, parsers_1.entityIncludeParser)({ host, target, mountPath, includeKey });
                }
                if (normalizedIncludePath.endsWith('custominclude')) {
                    (0, parsers_1.customIncludeParser)({ host, target, mountPath, includeKey });
                }
                if (normalizedIncludePath.endsWith('localeinclude')) {
                    (0, parsers_1.localeIncludeParser)({ host, target, mountPath, includeKey });
                }
            }
        });
    },
    dynamic: (host) => {
        host?.metadata?.includes?.dynamic?.forEach((includePath) => {
            // No need to check if it is a query include.
            (0, parsers_1.queryIncludeParser)({ host, includePath });
        });
    },
};

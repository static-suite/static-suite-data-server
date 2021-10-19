"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheStatus = void 0;
var CacheStatus;
(function (CacheStatus) {
    CacheStatus[CacheStatus["MISS"] = 0] = "MISS";
    CacheStatus[CacheStatus["HIT"] = 1] = "HIT";
})(CacheStatus || (CacheStatus = {}));
exports.CacheStatus = CacheStatus;

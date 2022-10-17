"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQueryErrorResponse = exports.CacheStatus = void 0;
/**
 * Possible values for a cache get operation: miss or hit.
 *
 * @public
 */
var CacheStatus;
(function (CacheStatus) {
    CacheStatus["MISS"] = "miss";
    CacheStatus["HIT"] = "hit";
})(CacheStatus = exports.CacheStatus || (exports.CacheStatus = {}));
/**
 * Tells whether a query response is erroneous or not.
 *
 * @param queryResponse - A response (successful or erroneous) from the query handler.
 * @returns True if queryResponse is erroneous.
 */
const isQueryErrorResponse = (queryResponse) => queryResponse.error !== undefined;
exports.isQueryErrorResponse = isQueryErrorResponse;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.storeDataSkeleton = void 0;
const object_1 = require("@lib/utils/object");
const store_constants_1 = require("./store.constants");
/**
 * An skeleton for the data in the store.
 *
 * @remarks
 * It must be deep cloned to avoid using the same object instead of a new one.
 * */
exports.storeDataSkeleton = {
    [store_constants_1.JSON_ITEMS]: {
        [store_constants_1.MAIN]: [],
        [store_constants_1.VARIANTS]: {},
    },
};
const rootStoreDataSkeleton = (0, object_1.deepClone)(exports.storeDataSkeleton);
rootStoreDataSkeleton[store_constants_1.INDEX] = new Map();
exports.store = {
    syncDate: null,
    data: rootStoreDataSkeleton,
};

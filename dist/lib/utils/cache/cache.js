"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cache = void 0;
const data = new Map();
const initBin = (bin) => {
    data.set(bin, new Map());
};
exports.cache = {
    set: (bin, key, value) => {
        if (!data.has(bin)) {
            initBin(bin);
        }
        data.get(bin)?.set(key, value);
    },
    get: (bin, key) => data.get(bin)?.get(key),
    delete: (bin, key) => data.get(bin)?.delete(key) || false,
    count: (bin) => data.get(bin)?.size || 0,
    reset: (bin) => initBin(bin),
};

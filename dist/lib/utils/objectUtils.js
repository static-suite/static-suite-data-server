"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepClone = exports.hasKey = exports.isEmptyObject = void 0;
const isEmptyObject = (object) => Object.keys(object).length === 0;
exports.isEmptyObject = isEmptyObject;
const hasKey = (obj, key) => {
    return key in obj;
};
exports.hasKey = hasKey;
const deepClone = (object) => JSON.parse(JSON.stringify(object));
exports.deepClone = deepClone;

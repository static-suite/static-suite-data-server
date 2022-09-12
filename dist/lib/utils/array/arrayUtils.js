"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayRemoveByValue = void 0;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const arrayRemoveByValue = (arr, value) => {
    const index = arr.indexOf(value);
    if (index !== -1) {
        arr.splice(index, 1);
    }
};
exports.arrayRemoveByValue = arrayRemoveByValue;

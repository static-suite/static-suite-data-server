"use strict";
// export const debounce = (func: any, wait = 100) => {
//   let timeout: ;
//   return (...args) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => {
//       func.apply(this, args);
//     }, wait);
//   };
// };
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
const debounce = (callback, delay) => {
    let timeoutTimer;
    return (...args) => {
        clearTimeout(timeoutTimer);
        timeoutTimer = setTimeout(() => {
            callback(...args);
        }, delay);
    };
};
exports.debounce = debounce;

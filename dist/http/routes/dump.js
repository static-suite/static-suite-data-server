"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffIndex = void 0;
const dump_1 = require("@lib/store/dump");
const diffIndex = (req, res) => {
    dump_1.dumpManager.dump();
    const response = {
        result: 'Dump executed',
    };
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(response);
};
exports.diffIndex = diffIndex;
module.exports = { diffIndex: exports.diffIndex };

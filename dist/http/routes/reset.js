"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reset = void 0;
const dataDir_1 = require("@lib/store/dataDir");
const reset = (req, res) => {
    const startDate = Date.now();
    dataDir_1.dataDirManager.load({ incremental: false });
    const endDate = Date.now();
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send({ execTime: endDate - startDate });
};
exports.reset = reset;

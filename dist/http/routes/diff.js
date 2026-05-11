"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.diffReset = exports.diffFull = exports.diffIncremental = exports.diffIndex = void 0;
const diff_1 = require("../../lib/store/diff");
const object_1 = require("../../lib/utils/object");
const diffIndex = (req, res) => {
    res.render('diffIndex', {
        links: {
            '/diff/incremental': 'Execute an incremental diff',
            '/diff/full': 'Execute a full diff',
            '/diff/reset': 'Clears intermediate changes tracked by dependency manager',
        },
    });
};
exports.diffIndex = diffIndex;
const diffAction = (req, res, incremental) => {
    const diff = diff_1.diffManager.getDiff({ incremental });
    const diffAsJson = (0, object_1.jsonify)(diff);
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(diffAsJson);
};
const diffIncremental = (req, res) => {
    diffAction(req, res, true);
};
exports.diffIncremental = diffIncremental;
const diffFull = (req, res) => {
    diffAction(req, res, false);
};
exports.diffFull = diffFull;
const diffReset = (req, res) => {
    const args = req.query;
    if (args?.uniqueId) {
        diff_1.diffManager.reset(args.uniqueId);
    }
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send({ status: 'done' });
};
exports.diffReset = diffReset;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subset = void 0;
const store_1 = require("../../lib/store");
const dataDir_1 = require("../../lib/store/dataDir");
const subset = (req, res) => {
    dataDir_1.dataDirManager.update();
    const options = {};
    if (req.query.dir) {
        options.dir = req.query.dir;
    }
    if (req.query.variant) {
        if (req.query.variant === 'null') {
            options.variant = undefined;
        }
        else {
            options.variant = req.query.variant;
        }
    }
    if (req.query.ext) {
        options.ext = req.query.ext;
    }
    if (req.query.recursive) {
        options.recursive = req.query.recursive === 'true';
    }
    const returnedSubset = store_1.store.data.subset(options);
    let result;
    if (req.query.as === 'url') {
        result = returnedSubset.items
            .map(item => item.data?.content?.url?.path)
            .filter(path => !!path);
    }
    else {
        result = returnedSubset.filenames;
    }
    res.status(200);
    res.set({
        'Content-Type': 'application/json',
    });
    res.send(result);
};
exports.subset = subset;

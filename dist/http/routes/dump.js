"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpMetadataReset = exports.dumpMetadataShow = exports.dumpFull = exports.dumpIncremental = exports.dumpIndex = void 0;
const fs_1 = __importDefault(require("fs"));
const dump_1 = require("../../lib/store/dump");
const object_1 = require("../../lib/utils/object");
const config_1 = require("../../lib/config");
const dumpIndex = (req, res) => {
    res.render('dumpIndex', {
        links: {
            '/dump/incremental': 'Execute an incremental dump',
            '/dump/full': 'Execute a full dump',
            '/dump/metadata/show': 'Show dump metadata info',
            '/dump/metadata/reset': 'Reset dump metadata info',
        },
    });
};
exports.dumpIndex = dumpIndex;
const dumpAction = (req, res, incremental) => {
    const dump = dump_1.dumpManager.dump({ incremental });
    const dumpAsJson = (0, object_1.jsonify)(dump);
    const args = req.query;
    if (args?.noDiff !== undefined) {
        delete dumpAsJson.diff;
    }
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(dumpAsJson);
};
const dumpIncremental = (req, res) => {
    dumpAction(req, res, true);
};
exports.dumpIncremental = dumpIncremental;
const dumpFull = (req, res) => {
    dumpAction(req, res, false);
};
exports.dumpFull = dumpFull;
const getMetadata = () => {
    const metadataFilepath = `${config_1.config.dumpDir}/metadata.json`;
    return fs_1.default.existsSync(metadataFilepath)
        ? fs_1.default.readFileSync(metadataFilepath).toString()
        : '[]';
};
const dumpMetadataShow = (req, res) => {
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(getMetadata());
};
exports.dumpMetadataShow = dumpMetadataShow;
const dumpMetadataReset = (req, res) => {
    const args = req.query;
    if (args?.uniqueId) {
        dump_1.dumpManager.reset(args.uniqueId);
    }
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send(getMetadata());
};
exports.dumpMetadataReset = dumpMetadataReset;

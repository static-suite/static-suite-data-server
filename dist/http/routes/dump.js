"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpMetadata = exports.dumpFull = exports.dumpIncremental = exports.dumpIndex = void 0;
const fs_1 = __importDefault(require("fs"));
const dump_1 = require("@lib/store/dump");
const object_1 = require("@lib/utils/object");
const config_1 = require("@lib/config");
const dumpIndex = (req, res) => {
    res.render('statusIndex', {
        links: {
            '/dump/incremental': 'Execute an incremental dump',
            '/dump/full': 'Execute a full dump',
            '/dump/metadata': 'Dump metadata info',
        },
    });
};
exports.dumpIndex = dumpIndex;
const dumpIncremental = (req, res) => {
    const dump = dump_1.dumpManager.dump({ incremental: true });
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, object_1.jsonify)(dump));
};
exports.dumpIncremental = dumpIncremental;
const dumpFull = (req, res) => {
    const dump = dump_1.dumpManager.dump({ incremental: false });
    res.status(200);
    res.set({ 'Content-Type': 'application/json' });
    res.send((0, object_1.jsonify)(dump));
};
exports.dumpFull = dumpFull;
const dumpMetadata = (req, res) => {
    const metadataFilepath = `${config_1.config.dumpDir}/metadata.json`;
    if (fs_1.default.existsSync(metadataFilepath)) {
        const metadata = fs_1.default.readFileSync(metadataFilepath).toString();
        res.status(200);
        res.set({ 'Content-Type': 'application/json' });
        res.send(metadata);
    }
    else {
        res.status(404);
        res.send('Metadata file not found');
    }
};
exports.dumpMetadata = dumpMetadata;

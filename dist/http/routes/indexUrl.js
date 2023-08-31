"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexUrl = void 0;
const mime_types_1 = __importDefault(require("mime-types"));
const store_1 = require("../../lib/store");
const logger_1 = require("../../lib/utils/logger");
const dataDir_1 = require("../../lib/store/dataDir");
const indexUrl = (req, res) => {
    dataDir_1.dataDirManager.update();
    const storeKey = req.params[0] === 'index' ? '' : req.params[0];
    const storeFile = store_1.store.index.url.get(`/${storeKey}`);
    if (storeFile === undefined) {
        res.status(404);
        res.set({
            'Content-Type': 'text/plain',
        });
        res.send('not found');
    }
    else {
        // Render a single file.
        logger_1.logger.debug(`Rendering file "${storeKey}", type ${typeof storeFile}`);
        res.status(200);
        res.set({
            'Content-Type': mime_types_1.default.lookup(storeKey) || 'text/plain',
        });
        res.send(storeFile);
    }
};
exports.indexUrl = indexUrl;

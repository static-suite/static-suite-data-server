"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexUrl = void 0;
const store_1 = require("../../lib/store");
const logger_1 = require("../../lib/utils/logger");
const dataDir_1 = require("../../lib/store/dataDir");
const indexUrl = (req, res) => {
    dataDir_1.dataDirManager.update();
    const storeKeyParts = Array.from(req.params.storeKeyParts || []);
    const storeKey = storeKeyParts.length === 1 && storeKeyParts[0] === 'index'
        ? ''
        : storeKeyParts.join('/');
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
        logger_1.logger.debug(`Rendering file "/${storeKey}", type ${typeof storeFile}`);
        res.status(200);
        res.set({
            'Content-Type': 'application/json',
        });
        res.send(storeFile);
    }
};
exports.indexUrl = indexUrl;

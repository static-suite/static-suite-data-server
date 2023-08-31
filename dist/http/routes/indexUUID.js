"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexUUID = void 0;
const store_1 = require("../../lib/store");
const logger_1 = require("../../lib/utils/logger");
const dataDir_1 = require("../../lib/store/dataDir");
// Url format /index/uuid/fr/4c7a791d-f994-4a0a-81c5-b0cdf759f8b5
const indexUUID = (req, res) => {
    dataDir_1.dataDirManager.update();
    const storeKey = req.params[0].split('/');
    try {
        const storeFile = store_1.store.index.uuid.get(storeKey[0]).get(storeKey[1]);
        // Render a single file.
        logger_1.logger.debug(`Rendering file "${storeKey.join('/')}", type ${typeof storeFile}`);
        res.status(200);
        res.set({
            'Content-Type': 'text/plain',
        });
        res.send(storeFile);
    }
    catch (e) {
        res.status(404);
        res.set({
            'Content-Type': 'text/plain',
        });
        res.send('not found');
    }
};
exports.indexUUID = indexUUID;

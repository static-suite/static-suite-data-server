"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const store_1 = require("@lib/store");
const logger_1 = require("@lib/utils/logger");
const data = (req, res) => {
    const storeKey = req.params[0];
    const storeKeyParts = !storeKey || storeKey === '' ? null : storeKey.split('/');
    const storeFile = store_1.store.data.get(storeKey);
    if (storeFile === undefined) {
        // Render a directory
        let dirKey = '';
        if (storeKey) {
            dirKey = storeKey.endsWith('/') ? storeKey : `${storeKey}/`;
        }
        logger_1.logger.debug(`Rendering directory "${dirKey}"`);
        const storeDirSubset = store_1.store.subset({
            dir: dirKey,
            variant: undefined,
            ext: undefined,
            recursive: false,
        });
        // Obtain breadcrumbs.
        const breadcrumbs = storeKeyParts
            ? storeKeyParts.map((keyPart, index) => ({
                title: keyPart,
                url: storeKeyParts.slice(0, index + 1).join('/'),
            }))
            : [];
        const items = [];
        // Find directories, so they appear first on screen.
        const mapKeys = Array.from(store_1.store.data.keys());
        const foundDirs = new Map();
        const pattern = `^${dirKey}([^/]+)/.+$`;
        const regex = new RegExp(pattern);
        mapKeys.forEach(k => {
            const result = k.match(regex);
            const dir = result?.[1];
            if (dir && !foundDirs.has(dir)) {
                foundDirs.set(dir, true);
                items.push({
                    name: result[1],
                    type: 'directory',
                });
            }
        });
        // Add files so they appear after directories.
        let hasContentInfo = false;
        let info = null;
        storeDirSubset.items.forEach((item, key) => {
            const filename = storeDirSubset.filenames[key];
            info = {
                filename,
            };
            hasContentInfo = true;
            if (item.data?.content) {
                const content = item.data?.content;
                const { id, type, bundle, isPublished, title } = content;
                if (id || type || bundle || title) {
                    info = {
                        id,
                        type,
                        bundle,
                        isPublished,
                        title,
                        filename,
                        size: JSON.stringify(item).length,
                    };
                    hasContentInfo = true;
                }
            }
            items.push({
                name: path_1.default.basename(filename),
                type: Array.isArray(item) ? 'array' : typeof item,
                info,
            });
        });
        const vars = {
            base: dirKey,
            path: dirKey || '/',
            breadcrumbs,
            items,
            count: items.length,
            hasContentInfo,
        };
        res.render('data', vars);
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
exports.data = data;

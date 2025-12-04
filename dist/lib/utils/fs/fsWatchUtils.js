"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const logger_1 = require("../logger");
/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @remarks
 * It handles three different events: add, change and unlink
 *
 * @param paths - An array of paths to be watched
 * @param listeners - An object with three optional event keys (add, change and unlink)
 * and a listener function as value. That function will be executed once any of
 * the event keys is dispatched.
 */
const watch = (paths, listeners) => {
    if (paths.length > 0) {
        const watcher = chokidar_1.default.watch(paths, {
            ignored: /(^|[/\\])\../,
            persistent: true,
        });
        // Add event listeners.
        watcher.on('ready', () => {
            logger_1.logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
            watcher
                .on('add', filePath => {
                logger_1.logger.debug(`File ${filePath} added`);
                listeners.add(filePath);
            })
                .on('change', filePath => {
                logger_1.logger.debug(`File ${filePath} changed`);
                listeners.change(filePath);
            })
                .on('unlink', filePath => {
                logger_1.logger.debug(`File ${filePath} removed`);
                listeners.unlink(filePath);
            });
        });
    }
};
exports.watch = watch;

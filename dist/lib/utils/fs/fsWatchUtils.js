"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.watch = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const logger_1 = require("../logger");
const debounce_1 = require("../misc/debounce");
/**
 * Watches for changes on a set of paths and attach listener to them
 *
 * @param paths - An array of paths to be watched
 * @param callback - A callback function to be executed when a file changes
 */
const watch = (paths, callback) => {
    if (paths.length > 0) {
        const listener = (eventType, filename) => {
            if (filename) {
                logger_1.logger.debug(`File ${filename} ${eventType}`);
                callback(filename);
            }
        };
        paths.forEach(path => {
            node_fs_1.default.watch(path, {
                ignore: /(^|[/\\])\../,
                recursive: true,
            }, 
            // Ensure filenames are absolute
            (0, debounce_1.debounce)((eventType, filename) => filename ? listener(eventType, `${path}/${filename}`) : null, 300));
        });
        logger_1.logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
    }
};
exports.watch = watch;

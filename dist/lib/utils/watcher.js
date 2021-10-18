"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWatcher = void 0;
const path_1 = __importDefault(require("path"));
const chokidar_1 = __importDefault(require("chokidar"));
const config_1 = require("@lib/config");
const dataDirManager_1 = require("@lib/store/dataDir/dataDirManager");
const dataServer_types_1 = require("@lib/dataServer.types");
const logger_1 = require("./logger");
const moduleHandler_1 = require("./moduleHandler");
// If module is a post processor, rebuild the whole store
// so it can be re-evaluated.
const conditionallyResetStore = (filePath) => {
    const postProcessorDir = config_1.config.postProcessor
        ? path_1.default.dirname(config_1.config.postProcessor)
        : null;
    if (postProcessorDir && filePath.indexOf(postProcessorDir) !== -1) {
        dataDirManager_1.dataDirManager.loadDataDir({ useCache: true });
        logger_1.logger.info(`Re-building store done`);
    }
};
// Initialize watcher.
const initWatcher = () => {
    if (config_1.config.runMode === dataServer_types_1.RunMode.DEV &&
        (config_1.config.queryDir || config_1.config.postProcessor)) {
        const paths = [];
        if (config_1.config.queryDir) {
            paths.push(config_1.config.queryDir);
        }
        if (config_1.config.postProcessor) {
            paths.push(config_1.config.postProcessor);
        }
        if (paths.length > 0) {
            const watcher = chokidar_1.default.watch(paths, {
                ignored: /(^|[/\\])\../,
                persistent: true,
            });
            // Add event listeners. None of these events need to clear any query cache,
            // since they only run on dev mode, where caches are disabled. They only
            // need to rebuild the store if a post processor changes.
            watcher.on('ready', () => {
                logger_1.logger.debug(`Watcher listening for changes on ${paths.join(',')}`);
                watcher
                    .on('add', filePath => {
                    logger_1.logger.debug(`File ${filePath} added`);
                    moduleHandler_1.moduleHandler.load(filePath);
                    conditionallyResetStore(filePath);
                    logger_1.logger.info(`Re-building development modules done`);
                })
                    .on('change', filePath => {
                    logger_1.logger.debug(`File ${filePath} changed`);
                    moduleHandler_1.moduleHandler.init();
                    conditionallyResetStore(filePath);
                    logger_1.logger.info(`Re-building development modules done`);
                })
                    .on('unlink', filePath => {
                    logger_1.logger.debug(`File ${filePath} removed`);
                    moduleHandler_1.moduleHandler.remove(filePath);
                    conditionallyResetStore(filePath);
                    logger_1.logger.info(`Re-building development modules done`);
                });
            });
        }
    }
};
exports.initWatcher = initWatcher;

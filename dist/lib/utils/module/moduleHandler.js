"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleHandler = void 0;
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const path_1 = __importDefault(require("path"));
const config_1 = require("@lib/config");
const logger_1 = require("@lib/utils/logger");
const fs_1 = require("@lib/utils/fs");
const modules = {};
exports.moduleHandler = {
    init: () => {
        if (config_1.config.queryDir) {
            const { queryDir } = config_1.config;
            const allQueryModules = (0, fs_1.findFilesInDir)(queryDir, '**/*.js');
            allQueryModules.forEach(queryModule => {
                const modulePath = path_1.default.join(queryDir, queryModule);
                // Use https://www.npmjs.com/package/decache as an alternative.
                delete require.cache[require.resolve(modulePath)];
                exports.moduleHandler.load(modulePath);
            });
        }
        if (config_1.config.postProcessor) {
            delete require.cache[require.resolve(config_1.config.postProcessor)];
            exports.moduleHandler.load(config_1.config.postProcessor);
        }
    },
    load: (modulePath) => {
        delete modules[modulePath];
        modules[modulePath] = require(modulePath);
        if (!modules[modulePath]) {
            throw Error(`Query "${modulePath}" not loaded.`);
        }
        logger_1.logger.debug(`Load for ${modulePath} done.`);
        return modules[modulePath];
    },
    remove: (modulePath) => {
        logger_1.logger.debug(`Remove for ${modulePath} done.`);
        delete require.cache[require.resolve(modulePath)];
        delete modules[modulePath];
    },
    get: (modulePath) => modules[modulePath] || exports.moduleHandler.load(modulePath),
};

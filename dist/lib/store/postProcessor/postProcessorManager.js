"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProcessorManager = void 0;
const config_1 = require("@lib/config");
const module_1 = require("@lib/utils/module");
exports.postProcessorManager = {
    getPostProcessor: () => config_1.config.postProcessor
        ? module_1.moduleHandler.get(config_1.config.postProcessor)
        : null,
};

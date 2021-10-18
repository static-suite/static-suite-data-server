"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postProcessorManager = void 0;
const config_1 = require("@lib/config");
const moduleHandler_1 = require("@lib/utils/moduleHandler");
exports.postProcessorManager = {
    getPostProcessor: () => config_1.config.postProcessor
        ? moduleHandler_1.moduleHandler.get(config_1.config.postProcessor)
        : null,
};

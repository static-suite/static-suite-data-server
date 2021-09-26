"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostProcessor = void 0;
const config_1 = require("../config");
const moduleHandler_1 = require("../utils/moduleHandler");
const getPostProcessor = () => config_1.config.postProcessor
    ? moduleHandler_1.moduleHandler.get(config_1.config.postProcessor)
    : null;
exports.getPostProcessor = getPostProcessor;

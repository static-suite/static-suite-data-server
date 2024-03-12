"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogFile = void 0;
const config_1 = require("../../../config");
/**
 * Gets the absolute path to Static Suite's log file.
 *
 * @returns The absolute path to Static Suite's log file.
 */
const getLogFile = () => config_1.config.workDir ? `${config_1.config.workDir}/lock-executed.log` : null;
exports.getLogFile = getLogFile;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariantKey = exports.parseJsonString = void 0;
const path_1 = __importDefault(require("path"));
const logger_1 = require("@lib/utils/logger");
/**
 * A set of various functions related to the file system
 */
/**
 * Separator for variant data files saved to storage.
 *
 * @remarks
 * Refers to the separator that is used by variant data files when they are
 * saved. If a "master" data file name is "12345.json", and its variant keys
 * are "card" and "search", its resulting variant file names are:
 *   - 12345--card.json
 *   - 12345--search.json
 * @see Drupal\static_export\Exporter\ExporterPluginInterface::VARIANT_SEPARATOR
 * in https://www.drupal.org/project/static_suite
 *
 * @sealed
 * Not intended to be over ride.
 */
const VARIANT_SEPARATOR = '--';
/**
 * Parses a JSON string and logs an error on failure.
 *
 * @param jsonString - The string to be parsed.
 *
 * @returns A JSON object or null on error.
 */
const parseJsonString = (jsonString) => {
    let json = null;
    try {
        json = JSON.parse(jsonString);
    }
    catch (error) {
        logger_1.logger.error(`Error parsing JSON data "${jsonString}": ${error}`);
    }
    return json;
};
exports.parseJsonString = parseJsonString;
/**
 * Gets a data file's variant key
 *
 * @param filePath - Absolute path to the data file
 *
 * @returns The file's variant key, or null on error
 */
const getVariantKey = (filePath) => {
    const fileName = path_1.default.parse(filePath).name;
    if (fileName.indexOf(VARIANT_SEPARATOR) !== -1) {
        return fileName.split(VARIANT_SEPARATOR).pop() || null;
    }
    return null;
};
exports.getVariantKey = getVariantKey;

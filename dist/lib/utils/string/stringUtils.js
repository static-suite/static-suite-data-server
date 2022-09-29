"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUniqueId = exports.parseUniqueId = exports.parseURLSearchParams = exports.parseJsonString = exports.VARIANT_SEPARATOR = void 0;
const logger_1 = require("@lib/utils/logger");
/**
 * Separator for variant data files saved to storage.
 *
 * @remarks
 * Refers to the separator that is used by variant data files when they are
 * saved. If a "master" data file name is "12345.json", and its variant keys
 * are "card" and "search", its resulting variant file names are:
 *   - 12345--card.json
 *   - 12345--search.json
 * @see ExporterPluginInterface::VARIANT_SEPARATOR in https://www.drupal.org/project/static_suite
 *
 * @sealed
 * Not intended to be over ride.
 */
exports.VARIANT_SEPARATOR = '--';
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
 * Parses a raw URL search (aka "query string") into an object.
 *
 * @remarks
 * Turns a string like "arg1=a&arg2=b" into an object like
 * \{ arg1: 'a', arg2: 'b'\}
 *
 * @param queryString - A raw URL search string
 *
 * @returns An object where its keys are the query arguments.
 */
const parseURLSearchParams = (queryString) => {
    const params = new URLSearchParams(queryString);
    const obj = {};
    Array.from(params.keys()).forEach(key => {
        if (params.getAll(key).length > 1) {
            obj[key] = params.getAll(key);
        }
        else {
            obj[key] = params.get(key);
        }
    });
    return obj;
};
exports.parseURLSearchParams = parseURLSearchParams;
/**
 * Parses a unique id from Static Suite and returns a Date.
 *
 * @param uniqueId - A unique id from Static Suite
 *
 * @returns A date from that unique id, or null if it can be parsed.
 */
const parseUniqueId = (uniqueId) => {
    // todo - Do not use dates and use timestamps in all cases
    //  to avoid having to fix offsets.
    const date = new Date();
    const dateOffset = -(date.getTimezoneOffset() * 60 * 1000);
    const dateString = uniqueId.replace(/(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.(\d{3}).*/, '$1-$2-$3T$4:$5:$6.$7');
    const parsedDate = Date.parse(dateString);
    if (!Number.isNaN(parsedDate)) {
        return new Date(parsedDate + dateOffset);
    }
    return null;
};
exports.parseUniqueId = parseUniqueId;
/**
 * Checks that a string is a unique id.
 *
 * @param uniqueId - A unique id t be checked
 */
const isUniqueId = (uniqueId) => /(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.(\d{3}).*/.test(uniqueId);
exports.isUniqueId = isUniqueId;

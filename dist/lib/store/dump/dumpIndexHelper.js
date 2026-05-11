"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpIndexHelper = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../../utils/logger");
const string_1 = require("../../utils/string");
const config_1 = require("../../config");
// import { Dump, DumpMetadata } from './dump.types';
// import { unixEpochUniqueId } from '../workDir';
const fs_2 = require("../../utils/fs");
const index = new Map();
let isStale = undefined;
const getIndexFilepath = () => `${config_1.config.dumpDir}/files.idx`;
const getIndexIsStaleFlagFilepath = () => `${config_1.config.dumpDir}/index-is-stale.flag`;
const indexToString = () => {
    const indexLines = [];
    index.forEach((value, filePath) => {
        const line = [filePath, value.hash, value.url];
        indexLines.push(line.join('\t'));
    });
    return indexLines.join('\n');
};
const setIsStale = (value) => {
    if (isStale !== value) {
        isStale = value;
        const indexIsStaleFlagFilepath = getIndexIsStaleFlagFilepath();
        if (isStale === true) {
            fs_1.default.writeFileSync(indexIsStaleFlagFilepath, '');
        }
        else {
            if (fs_1.default.existsSync(indexIsStaleFlagFilepath)) {
                fs_1.default.unlinkSync(indexIsStaleFlagFilepath);
            }
        }
    }
};
exports.dumpIndexHelper = {
    isDumpIndexStale: () => {
        if (isStale === undefined) {
            const indexIsStaleFlagFilepath = getIndexIsStaleFlagFilepath();
            if (fs_1.default.existsSync(indexIsStaleFlagFilepath)) {
                setIsStale(true);
            }
            else {
                setIsStale(false);
            }
        }
        return !!isStale;
    },
    isDumpIndexPresent: () => fs_1.default.existsSync(getIndexFilepath()),
    saveDumpIndex: () => {
        if (isStale) {
            const indexFilepath = getIndexFilepath();
            const indexAsString = indexToString().trim();
            fs_1.default.writeFileSync(indexFilepath, indexAsString);
            setIsStale(false);
        }
    },
    createDumpIndex: () => {
        if (config_1.config.dumpDir) {
            setIsStale(true);
            logger_1.logger.info('Creating dump index...');
            const startDate = Date.now();
            index.clear();
            const filesDumpDir = `${config_1.config.dumpDir}/files`;
            const relativeFilePaths = (0, fs_2.findFilesInDir)(filesDumpDir);
            relativeFilePaths.forEach(relativeFilePath => {
                const fileContent = (0, fs_2.getFileContent)(`${filesDumpDir}/${relativeFilePath}`);
                if (fileContent.raw) {
                    const url = fileContent.json
                        ? fileContent.json.data?.content?.url?.path
                        : null;
                    const hash = (0, string_1.createHash)(fileContent.raw);
                    index.set(relativeFilePath, { hash, url });
                }
            });
            // Save index into disk
            exports.dumpIndexHelper.saveDumpIndex();
            logger_1.logger.info(`${relativeFilePaths.length} files in dump indexed in ${Date.now() - startDate}ms.`);
        }
    },
    loadDumpIndex: () => {
        if (config_1.config.dumpDir) {
            logger_1.logger.info('Loading dump index...');
            const startDate = Date.now();
            const indexFilepath = getIndexFilepath();
            const data = fs_1.default.readFileSync(indexFilepath).toString().trim();
            index.clear();
            // Split lines and remove empty ones.
            const dataLines = data.split('\n').filter(line => !!line);
            dataLines.forEach(line => {
                const [relativeFilePath, hash, url] = line.split('\t');
                index.set(relativeFilePath, { hash, url });
            });
            logger_1.logger.info(`${dataLines.length} entries loaded from dump index in ${Date.now() - startDate}ms.`);
        }
    },
    hasEntry: (relativeFilePath) => index.has(relativeFilePath),
    getEntry: (relativeFilePath) => index.get(relativeFilePath),
    getKeys: () => index.keys(),
    addEntry: (relativeFilePath, entry) => {
        setIsStale(true);
        index.set(relativeFilePath, entry);
    },
    removeEntry: (relativeFilePath) => {
        setIsStale(true);
        index.delete(relativeFilePath);
    },
};

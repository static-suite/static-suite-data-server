"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dirBasedModuleGroupManager = void 0;
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const fs_1 = require("../fs");
const cache_1 = require("../cache");
const moduleManager_1 = require("./moduleManager");
/**
 * A manager of module groups based on a directory.
 *
 * A module group is a set of user-land modules that are stored inside
 * a directory. The contents of that directory are unknown, and it can contain
 * modules and other non-module files required by those modules.
 *
 * Modules are distinguished from other files because they contain a key as a suffix,
 * at the end of their name, following this pattern: [MODULE_ID].[KEY].js
 *
 * For example:
 *
 * - lastContents.query.js
 * - listByTermId.query.js
 * - taxonomy.hook.js
 * - media.hook.js
 *
 * This manager provided a set of common functionalities for those kind of
 * directories.
 *
 * @param key - Key to distinguish modules from other files. This key is
 * also used to derive the name of the configuration option that defines
 * the path to the directory where the module group is stored, following this
 * pattern: `${key}Dir`
 * @returns A module group manager with a set of common functionalities
 * for those kind of directories.
 */
const dirBasedModuleGroupManager = (
// Key needs to be explicitly defined to make TypeScript happy.
key) => {
    /**
     * Cache bin used by this module group
     */
    const moduleGroupInfo = cache_1.cache.bin(`${key}-modules`);
    const moduleGroupManager = {
        getModuleGroupInfo: () => {
            // Use config here, because outside this function, the config object is not
            // already defined.
            const dir = config_1.config[`${key}Dir`];
            // Scan directory only if moduleGroupInfo is empty.
            if (dir && moduleGroupInfo.size === 0) {
                // For each detected module, get all its information.
                (0, fs_1.findFilesInDir)(dir, `**/*.${key}.js`).forEach(filepath => {
                    const replace = `.${key}.js$`;
                    const moduleId = filepath.replace(new RegExp(replace), '');
                    const absolutePath = path_1.default.join(dir, filepath);
                    moduleGroupInfo.set(moduleId, {
                        id: moduleId,
                        absolutePath,
                        relativePath: filepath,
                        getModule: () => moduleManager_1.moduleManager.get(absolutePath),
                    });
                });
            }
            return moduleGroupInfo;
        },
        reset: () => {
            // Use config here, because outside this function, the config object is not
            // already defined.
            const dir = config_1.config[`${key}Dir`];
            moduleManager_1.moduleManager.removeAll(new RegExp(`^${dir}`));
            moduleGroupInfo.clear();
        },
    };
    return moduleGroupManager;
};
exports.dirBasedModuleGroupManager = dirBasedModuleGroupManager;

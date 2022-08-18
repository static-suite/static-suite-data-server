import { ModuleGroupManager } from './module.types';
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
export declare const dirBasedModuleGroupManager: <ModuleType>(key: 'hook' | 'query' | 'task') => ModuleGroupManager<ModuleType>;
//# sourceMappingURL=dirBasedModuleGroupManager.d.ts.map
import path from 'path';
import { config } from '@lib/config';
import { findFilesInDir } from '@lib/utils/fs';
import { cache } from '@lib/utils/cache';
import { moduleManager } from './moduleManager';
import { ModuleGroupManager, ModuleInfo } from './module.types';

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
export const dirBasedModuleGroupManager = <ModuleType>(
  // Key needs to be explicitly defined to make TypeScript happy.
  key: 'hook' | 'query',
): ModuleGroupManager<ModuleType> => {
  /**
   * Cache bin used by this module group
   */
  const moduleGroupInfo = cache.bin<ModuleInfo<ModuleType>>(`${key}-modules`);

  const moduleGroupManager = {
    getModuleGroupInfo: (): Map<string, ModuleInfo<ModuleType>> => {
      // Use config here, because outside this function, the config object is not
      // already defined.
      const dir = config[`${key}Dir`];
      if (dir && moduleGroupInfo.size === 0) {
        // For each detected module, get all its information.
        findFilesInDir(dir, `**/*.${key}.js`).forEach(filepath => {
          const replace = `.${key}.js$`;
          const moduleId = filepath.replace(new RegExp(replace), '');
          const absolutePath = path.join(dir, filepath);
          moduleGroupInfo.set(moduleId, {
            id: moduleId,
            absolutePath,
            relativePath: filepath,
            getModule: () => moduleManager.get<ModuleType>(absolutePath),
          });
        });
      }

      return moduleGroupInfo;
    },

    reset: () => {
      // Use config here, because outside this function, the config object is not
      // already defined.
      const dir = config[`${key}Dir`];
      moduleManager.removeAll(new RegExp(`^${dir}`));
      moduleGroupInfo.clear();
    },
  };

  return moduleGroupManager;
};

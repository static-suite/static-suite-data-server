import { config } from '@lib/config';
import { findFilesInDir } from '@lib/utils/fs';
import { moduleHandler } from '@lib/utils/module';
// import { moduleHandler } from '@lib/utils/module';
import { HookModule } from './hook.types';

export const hookManager = {
  getHookModules: (): HookModule[] => {
    if (config.hookDir) {
      const availableHookModulePaths = findFilesInDir(
        config.hookDir,
        '**/*.hook.js',
        {
          absolute: true,
        },
      ).map(filename => filename.replace('.hook.js', ''));

      return availableHookModulePaths.map(modulePath =>
        moduleHandler.get(modulePath),
      );
    }
    return [];
  },

  /**
   * Get a list of absolute paths of available hook modules.
   *
   * @returns Array with absolute paths of available hook modules.
   */
  getAvailableHookModulePaths: (): string[] => {
    if (config.hookDir) {
      return findFilesInDir(config.hookDir, '**/*.hook.js', {
        absolute: true,
      });
    }
    return [];
  },
};

import { config } from '@lib/config';
import { store } from '@lib/store';
import { logger } from '@lib/utils/logger';
import { dependencyTagger } from '@lib/store/dependency/dependencyTagger';
import { FileType } from '@lib/utils/fs/fs.types';
import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { HookManager, HookModule } from './hook.types';
import { Dump } from '../dump/dump.types';

/**
 * A manager for hooks stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
const moduleManager = dirBasedModuleGroupManager<HookModule>('hook');

/**
 * A specialized hook manager with invoke helpers for all hooks
 */
export const hookManager: HookManager = {
  reset() {
    moduleManager.reset();
  },

  invokeOnStoreLoadStart() {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreLoadStart) {
        hookModule.onStoreLoadStart({
          store,
          logger,
          dependencyTagger,
        });
      }
    });
  },

  invokeOnProcessFile({ relativeFilepath, fileContent }) {
    let processedFileContent = fileContent;
    let returnValue: FileType | null = null;
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onProcessFile) {
        returnValue = hookModule.onProcessFile({
          relativeFilepath,
          fileContent: processedFileContent,
          store,
          logger,
          dependencyTagger,
        });
        if (returnValue) {
          processedFileContent = returnValue;
        }
      }
    });
    return processedFileContent;
  },

  invokeOnStoreItemAdd({ relativeFilepath, storeItem }): void {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemAdd) {
        hookModule.onStoreItemAdd({
          relativeFilepath,
          store,
          logger,
          dependencyTagger,
          storeItem,
        });
      }
    });
  },

  invokeOnStoreLoadDone() {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreLoadDone) {
        hookModule.onStoreLoadDone({
          store,
          logger,
          dependencyTagger,
        });
      }
    });
  },

  invokeOnStoreChangeStart(changedFiles) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreChangeStart) {
        hookModule.onStoreChangeStart({
          store,
          logger,
          dependencyTagger,
          changedFiles,
        });
      }
    });
  },

  invokeOnStoreItemBeforeUpdate({ relativeFilepath, storeItem }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemBeforeUpdate) {
        hookModule.onStoreItemBeforeUpdate({
          store,
          logger,
          dependencyTagger,
          relativeFilepath,
          storeItem,
        });
      }
    });
  },

  invokeOnStoreItemAfterUpdate({
    relativeFilepath,
    storeItem,
    previousStoreItem,
  }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemAfterUpdate) {
        hookModule.onStoreItemAfterUpdate({
          store,
          logger,
          dependencyTagger,
          relativeFilepath,
          storeItem,
          previousStoreItem,
        });
      }
    });
  },

  invokeOnStoreItemDelete({ relativeFilepath, storeItem }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemDelete) {
        hookModule.onStoreItemDelete({
          store,
          logger,
          dependencyTagger,
          relativeFilepath,
          storeItem,
        });
      }
    });
  },

  invokeOnStoreChangeDone(changedFiles) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreChangeDone) {
        hookModule.onStoreChangeDone({
          store,
          logger,
          dependencyTagger,
          changedFiles,
        });
      }
    });
  },

  invokeOnDumpCreate(dump) {
    let processedDump = dump;
    let returnValue: Dump | null = null;
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (config.dumpDir && hookModule.onDumpCreate) {
        returnValue = hookModule.onDumpCreate({
          dumpDir: config.dumpDir,
          store,
          dump: processedDump,
        });
        if (returnValue) {
          processedDump = returnValue;
        }
      }
    });
    return processedDump;
  },
};

import { config } from '@lib/config';
import { store } from '@lib/store';
import { dependencyTagger } from '@lib/store/dependency/dependencyTagger';
import { FileType } from '@lib/utils/fs/fs.types';
import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { HookManager, HookModule } from './hook.types';
import { Dump } from '../dump/dumpManager.types';

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
          dependencyTagger,
        });
        if (returnValue) {
          processedFileContent = returnValue;
        }
      }
    });
    return processedFileContent;
  },

  invokeOnStoreItemAdd({ relativeFilepath, fileContent }): void {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemAdd) {
        hookModule.onStoreItemAdd({
          relativeFilepath,
          fileContent,
          store,
          dependencyTagger,
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
          dependencyTagger,
          changedFiles,
        });
      }
    });
  },

  invokeOnStoreItemBeforeUpdate({ relativeFilepath, fileContent }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemBeforeUpdate) {
        hookModule.onStoreItemBeforeUpdate({
          store,
          dependencyTagger,
          relativeFilepath,
          fileContent,
        });
      }
    });
  },

  invokeOnStoreItemAfterUpdate({ relativeFilepath, fileContent }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemAfterUpdate) {
        hookModule.onStoreItemAfterUpdate({
          store,
          dependencyTagger,
          relativeFilepath,
          fileContent,
        });
      }
    });
  },

  invokeOnStoreItemDelete({ relativeFilepath, fileContent }) {
    const hookModulesInfo = moduleManager.getModuleGroupInfo();
    hookModulesInfo.forEach(hookInfo => {
      const hookModule = hookInfo.getModule();
      if (hookModule.onStoreItemDelete) {
        hookModule.onStoreItemDelete({
          store,
          dependencyTagger,
          relativeFilepath,
          fileContent,
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookManager = void 0;
const config_1 = require("@lib/config");
const store_1 = require("@lib/store");
const dependencyTagger_1 = require("@lib/store/dependency/dependencyTagger");
const module_1 = require("@lib/utils/module");
/**
 * A manager for hooks stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
const moduleManager = (0, module_1.dirBasedModuleGroupManager)('hook');
/**
 * A specialized hook manager with invoke helpers for all hooks
 */
exports.hookManager = {
    reset() {
        moduleManager.reset();
    },
    invokeOnStoreLoadStart() {
        const hookModulesInfo = moduleManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreLoadStart) {
                hookModule.onStoreLoadStart({
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
                });
            }
        });
    },
    invokeOnProcessFile({ relativeFilepath, fileContent }) {
        let processedFileContent = fileContent;
        let returnValue = null;
        const hookModulesInfo = moduleManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onProcessFile) {
                returnValue = hookModule.onProcessFile({
                    relativeFilepath,
                    fileContent: processedFileContent,
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
                });
                if (returnValue) {
                    processedFileContent = returnValue;
                }
            }
        });
        return processedFileContent;
    },
    invokeOnStoreItemAdd({ relativeFilepath, fileContent }) {
        const hookModulesInfo = moduleManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (hookModule.onStoreItemAdd) {
                hookModule.onStoreItemAdd({
                    relativeFilepath,
                    fileContent,
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
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
                    store: store_1.store,
                    dependencyTagger: dependencyTagger_1.dependencyTagger,
                    changedFiles,
                });
            }
        });
    },
    invokeOnDumpCreate(dump) {
        let processedDump = dump;
        let returnValue = null;
        const hookModulesInfo = moduleManager.getModuleGroupInfo();
        hookModulesInfo.forEach(hookInfo => {
            const hookModule = hookInfo.getModule();
            if (config_1.config.dumpDir && hookModule.onDumpCreate) {
                returnValue = hookModule.onDumpCreate({
                    dumpDir: config_1.config.dumpDir,
                    store: store_1.store,
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

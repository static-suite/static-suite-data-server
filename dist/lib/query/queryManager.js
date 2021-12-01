"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryManager = void 0;
const module_1 = require("@lib/utils/module");
/**
 * A manager for queries stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
exports.queryManager = (0, module_1.dirBasedModuleGroupManager)('query');

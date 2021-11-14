import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { HookModule } from './hook.types';

/**
 * A manager for hooks stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
export const hookManager = dirBasedModuleGroupManager<HookModule>('hook');

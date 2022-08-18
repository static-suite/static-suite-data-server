import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { TaskModule } from './task.types';

/**
 * A manager for tasks stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
export const taskManager = dirBasedModuleGroupManager<TaskModule>('task');

import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { QueryModule } from './query.types';

/**
 * A manager for queries stored in a user-land directory defined by configuration.
 *
 * @remarks
 * It extends dirBasedModuleGroupManager, which manages groups of modules based
 * on a directory: @see {@link dirBasedModuleGroupManager}
 */
export const queryManager = dirBasedModuleGroupManager<QueryModule>('query');

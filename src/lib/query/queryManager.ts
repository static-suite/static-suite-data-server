import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { QueryModule } from './query.types';

export const queryManager = dirBasedModuleGroupManager<QueryModule>('query');

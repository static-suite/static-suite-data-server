import { dirBasedModuleGroupManager } from '@lib/utils/module';
import { HookModule } from './hook.types';

export const hookManager = dirBasedModuleGroupManager<HookModule>('hook');

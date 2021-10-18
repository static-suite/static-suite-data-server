import { config } from '@lib/config';
import { moduleHandler } from '@lib/utils/moduleHandler';
import { PostProcessor } from './postProcessor.types';

export const postProcessorManager = {
  getPostProcessor: (): PostProcessor | null =>
    config.postProcessor
      ? moduleHandler.get<PostProcessor>(config.postProcessor)
      : null,
};

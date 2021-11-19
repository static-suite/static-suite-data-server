import { Json } from '@lib/utils/string/string.types';

export type IncludeMetadata = {
  metadata?: { includes?: Array<string> };
};

export type JsonIncludeMetadata = Json & IncludeMetadata;

type EntityDataContent = {
  data: any;
};

export type IncludeParserOptions = {
  fileContent: Json;
  includeData: Json | EntityDataContent;
  mountPointPath: string[];
  includeKey: string;
};

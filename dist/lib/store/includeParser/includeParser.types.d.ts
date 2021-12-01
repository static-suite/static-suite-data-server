import { Json } from '@lib/utils/string/string.types';
export declare type IncludeMetadata = {
    metadata?: {
        includes?: Array<string>;
    };
};
export declare type JsonIncludeMetadata = Json & IncludeMetadata;
declare type EntityDataContent = {
    data: any;
};
export declare type IncludeParserOptions = {
    fileContent: Json;
    includeData: Json | EntityDataContent;
    mountPointPath: string[];
    includeKey: string;
};
export {};
//# sourceMappingURL=includeParser.types.d.ts.map
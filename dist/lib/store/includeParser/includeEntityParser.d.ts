import { Json } from '@lib/utils/string/string.types';
import { Store } from '../store.types';
declare type ParserOptions = {
    /**
     * File contents, an object with node data.
     */
    fileContent?: Json;
    /**
     * The data store.
     */
    store: Store;
};
export declare const includeEntityParser: ({ fileContent, store, }: ParserOptions) => void;
export {};
//# sourceMappingURL=includeEntityParser.d.ts.map
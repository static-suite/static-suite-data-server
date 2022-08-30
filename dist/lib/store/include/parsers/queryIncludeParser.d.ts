import { QueryIncludeParserOptions } from '../includeParser.types';
/**
 * Parses query includes.
 *
 * @remarks
 * Instead of executing a query and adding its result to a JSON file,
 * create a Proxy so queries are only executed when they are consumed,
 * in a Just-In-Time way.
 */
export declare const queryIncludeParser: ({ host, includePath, }: QueryIncludeParserOptions) => void;
//# sourceMappingURL=queryIncludeParser.d.ts.map